// src/lib/toastService.js
let toast;

export const setToast = (t) => {
  toast = t;
};

export const getToast = () => toast;

export const showToast = ({ title, description, status, duration = 4000 }) => {
  if (toast) {
    toast({
      title,
      description,
      status,
      duration,
      isClosable: true,
      position: "top",
    });
  }
};
