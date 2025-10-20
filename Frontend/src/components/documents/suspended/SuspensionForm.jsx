import React from "react";
import OffenseForm from "../offenses/OffenseForm";

const SuspensionForm = (props) => (
  <OffenseForm
    {...props}
    placeholder="Describe reason for suspension and duration..."
  />
);

export default SuspensionForm;
