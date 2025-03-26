import React from "react";
import ViewManager from "./view-manager";
import { AppmintForm } from "@appmint/form";

export const DataForm = ({ schema, data }) => {

  const onChange(path, value, data, file, error) => {
    console.log('onChange', path, value, data, file, error);
  }

  return (
    <ViewManager id={data.sk}>
      <AppmintForm datatype={data.datatype} schema={schema} data={data.data} id={data.sk || data.create_hash} onChange={onChange} />
    </ViewManager>
  );
};

