import NumberField from "@components/NumberInput";
import * as React from "react";
import { useEffect, useRef, useState } from "react";

export default function Test() {
  const [v, setV] = useState(10);

  useEffect(() => {
    console.log(v);
  }, [v]);

  return (
    <div className="w-screen bg-violet-100 p-12">
      <NumberField value={v} onChange={setV} className="pl-2" type="float" step={0.2} />
      {v}
    </div>
  );
}
