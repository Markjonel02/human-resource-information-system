import React from "react";
import OffenseForm from "./OffenseForm";

const SuspensionForm = (props) => (
  <OffenseForm
    {...props}
    placeholder="Describe reason for suspension and duration..."
  />
);

export default SuspensionForm;
