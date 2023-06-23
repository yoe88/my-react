import React, { forwardRef, useEffect, useRef, useState } from "react";

interface Field {
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  step?: number;
}

interface Restrict {
  type?: "integer" | "unsigned-integer" | "float" | "unsigned-float";
  min?: number;
  max?: number;
  maxLength?: number;
}

interface CustomProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "min" | "max" | "maxLength" | "step" | "value" | "onChange"> {}

interface Props<T = number | string> extends CustomProps, Restrict, Field {
  value: T;
  onChange(v: T): void;
}

function useNumberState<T>(props: Props<T>) {
  const { value, onChange, type = "integer", min, max, maxLength } = props;

  const isString = typeof value === "string";
  const isInt = type === "integer" || type === "unsigned-integer";
  const parseNumber = isInt ? parseInt : parseFloat;
  const validatedText = (value: string) => {
    switch (type) {
      case "integer":
        return /^-?\d*$/.test(value);
      case "unsigned-integer":
        return /^\d*$/.test(value);
      case "float":
        return /^-?\d*\.?\d*$/.test(value);
      case "unsigned-float":
        return /^\d*\.?\d*$/.test(value);
    }
  };

  const step = (() => {
    let step = props.step ?? 1;
    if (isInt) {
      step = Math.floor(step);
    }
    if (step === 0) step = 1;

    return step;
  })();

  const [text, setText] = useState(() => {
    if (isString) {
      if (validatedText(value)) {
        return value;
      } else {
        return "";
      }
    } else {
      return value + "";
    }
  });
  const numberRef = useRef(parseNumber(text));
  const number = numberRef.current;
  function setState(text: string) {
    const n = parseNumber(text);
    numberRef.current = n;
    onChange((isString ? text : n) as T);
  }

  function setBoth(text: string | number) {
    if (typeof text === "string") {
      setText(text);
      setState(text);
    } else {
      setText(text + "");
      setState(text + "");
    }
  }

  function validatedArrange(n: number) {
    if (max && n > max) {
      return false;
    }

    return !(min && n < min);
  }

  const canIncrement = (() => {
    if (isString) return false;
    if (isNaN(number)) return true;

    if (max) {
      return number + step <= max;
    }

    return true;
  })();

  const canDecrement = (() => {
    if (isString) return false;
    if (isNaN(number)) return true;

    if (min) {
      return number - step >= min;
    }

    return true;
  })();

  function increment() {
    if (!canIncrement) return;

    const n = isNaN(number) ? 0 : number;
    //소수점 에러 보정
    const result = +(n + step).toFixed(12);
    setBoth(result);
  }

  function decrement() {
    if (!canDecrement) return;

    const n = isNaN(number) ? 0 : number;
    const result = +(n - step).toFixed(12);
    setBoth(result);
  }

  function incrementToMax() {
    if (!isString && max) {
      setBoth(max);
    }
  }

  function decrementToMin() {
    if (!isString && min) {
      setBoth(min);
    }
  }

  function setInputValue(v: string) {
    if (maxLength && v.length > maxLength) return;

    if (v.length === 0) {
      return setBoth("");
    }

    //문자열 체크
    if (validatedText(v)) {
      setText(v);

      const n = parseNumber(v);
      //범위 체크
      if (validatedArrange(n)) {
        setState(v);
      } else {
        if (min && n < min) {
          setState(min + "");
        } else if (max && n > max) {
          setState(max + "");
        }
      }
    }
  }

  function commit() {
    const n = parseNumber(text);
    //공백인경우
    if (isNaN(n)) return;

    //내부 숫자랑 input값이 다른경우(주로 범위가 다른경우)
    if (n !== number) {
      setText(number + "");
    } else if (!isString) {
      //입력받은 타입이 숫자일때 문자열 009 숫자 9이면 9로 변환
      const n = String(number);
      if (n !== text) {
        setText(number + "");
      }
    }
  }

  return {
    numberValue: number,
    inputValue: text,
    setInputValue,
    commit,
    validatedText,

    canIncrement,
    canDecrement,
    increment,
    decrement,
    incrementToMax,
    decrementToMin,
  };
}

function NumberField<T = number | string>(props: Props<T>, ref: React.ForwardedRef<HTMLInputElement>) {
  const { disabled, readOnly } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const { inputValue, setInputValue, commit, validatedText, increment, decrement, incrementToMax, decrementToMin } = useNumberState(props);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!(e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || disabled || readOnly)) {
      switch (e.key) {
        case "PageUp":
        case "ArrowUp":
        case "Up":
          e.preventDefault();
          increment();
          break;
        case "PageDown":
        case "ArrowDown":
        case "Down":
          e.preventDefault();
          decrement();
          break;
        case "Home":
          e.preventDefault();
          decrementToMin();
          break;
        case "End":
          e.preventDefault();
          incrementToMax();
          break;
      }
    }

    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  }

  //React.FormEvent<HTMLInputElement>
  function onBeforeInput(e: any) {
    const input = e.target;
    const nextValue = input.value.slice(0, input.selectionStart) + e.data + input.value.slice(input.selectionEnd);
    if (!validatedText(nextValue)) {
      e.preventDefault();
    }

    if (props.onBeforeInput) props.onBeforeInput(e);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  function onBlur(e: React.FocusEvent<HTMLInputElement>) {
    commit();
    if (props.onBlur) props.onBlur(e);
  }

  function logging(text: string) {
    const span = document.createElement("div");
    span.textContent = text;
    divRef.current?.appendChild(span);

    setTimeout(() => {
      span.remove();
    }, 7000);
  }

  function clearLogging() {
    if (divRef.current == null) return;
    divRef.current.innerHTML = "";
  }

  useEffect(() => {
    clearLogging();
    logging(inputValue);
  }, [inputValue]);

  return (
    <>
      <input
        type="text"
        {...props}
        value={inputValue}
        onKeyDown={onKeyDown}
        onBeforeInput={onBeforeInput}
        onChange={onChange}
        onBlur={onBlur}
        ref={(el) => {
          inputRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
      />
      <div className="hidden" role="log" aria-live="assertive" aria-relevant="additions" ref={divRef}></div>
    </>
  );
}

export default forwardRef(NumberField);
