// hooks/useEmployeeForm.js
import { useState } from "react";

export const useEmployeeForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nationality, setNationality] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [religion, setReligion] = useState("");
  const [age, setAge] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [city, setCity] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [suffix, setSuffix] = useState("");
  const [prefix, setPrefix] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [corporateRank, setCorporateRank] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [location, setLocation] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [department, setDepartment] = useState("");
  const [head, setHead] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [salaryRate, setSalaryRate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [sssNumber, setSssNumber] = useState("");
  const [philhealthNumber, setPhilhealthNumber] = useState("");
  const [pagibigNumber, setPagibigNumber] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [achievements, setAchievements] = useState("");
  const [degree, setDegree] = useState("");
  const [educationalAttainment, setEducationalAttainment] = useState("");
  const [educationFrom, setEducationFrom] = useState("");
  const [educationTo, setEducationTo] = useState("");
  const [dependantName, setDependantName] = useState("");
  const [dependantRelationship, setDependantRelationship] = useState("");
  const [dependantBirthdate, setDependantBirthdate] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [employmentPosition, setEmploymentPosition] = useState("");
  const [employmentFrom, setEmploymentFrom] = useState("");
  const [employmentTo, setEmploymentTo] = useState("");

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setMiddleInitial("");
    setSuffix("");
    setPrefix("");
    setGender("");
    setBirthday("");
    setNationality("");
    setCivilStatus("");
    setReligion("");
    setAge("");
    setEmployeeRole("");
    setPresentAddress("");
    setCity("");
    setTown("");
    setProvince("");
    setMobileNumber("");
    setEmail("");
    setCompanyName("");
    setEmployeeId("");
    setJobPosition("");
    setCorporateRank("");
    setJobStatus("");
    setLocation("");
    setBusinessUnit("");
    setDepartment("");
    setHead("");
    setEmployeeStatus("");
    setSalaryRate("");
    setBankAccountNumber("");
    setTinNumber("");
    setSssNumber("");
    setPhilhealthNumber("");
    setPagibigNumber("");
    setSchoolName("");
    setAchievements("");
    setDegree("");
    setEducationalAttainment("");
    setEducationFrom("");
    setEducationTo("");
    setDependantName("");
    setDependantRelationship("");
    setDependantBirthdate("");
    setEmployerName("");
    setEmployerAddress("");
    setEmploymentPosition("");
    setEmploymentFrom("");
    setEmploymentTo("");
  };

  return {
    formState: {
      username,
      password,
      firstName,
      lastName,
      middleInitial,
      gender,
      birthday,
      nationality,
      civilStatus,
      religion,
      age,
      presentAddress,
      city,
      town,
      province,
      mobileNumber,
      email,
      suffix,
      prefix,
      companyName,
      employeeId,
      jobPosition,
      corporateRank,
      jobStatus,
      location,
      businessUnit,
      department,
      head,
      employeeStatus,
      employeeRole,
      salaryRate,
      bankAccountNumber,
      tinNumber,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      schoolName,
      achievements,
      degree,
      educationalAttainment,
      educationFrom,
      educationTo,
      dependantName,
      dependantRelationship,
      dependantBirthdate,
      employerName,
      employerAddress,
      employmentPosition,
      employmentFrom,
      employmentTo,
    },
    setters: {
      setUsername,
      setPassword,
      setFirstName,
      setLastName,
      setMiddleInitial,
      setGender,
      setBirthday,
      setNationality,
      setCivilStatus,
      setReligion,
      setAge,
      setPresentAddress,
      setCity,
      setTown,
      setProvince,
      setMobileNumber,
      setEmail,
      setSuffix,
      setPrefix,
      setCompanyName,
      setEmployeeId,
      setJobPosition,
      setCorporateRank,
      setJobStatus,
      setLocation,
      setBusinessUnit,
      setDepartment,
      setHead,
      setEmployeeStatus,
      setEmployeeRole,
      setSalaryRate,
      setBankAccountNumber,
      setTinNumber,
      setSssNumber,
      setPhilhealthNumber,
      setPagibigNumber,
      setSchoolName,
      setAchievements,
      setDegree,
      setEducationalAttainment,
      setEducationFrom,
      setEducationTo,
      setDependantName,
      setDependantRelationship,
      setDependantBirthdate,
      setEmployerName,
      setEmployerAddress,
      setEmploymentPosition,
      setEmploymentFrom,
      setEmploymentTo,
    },
    clearForm,
  };
};
