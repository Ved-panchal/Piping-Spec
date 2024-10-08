// import { object } from "framer-motion/client";
import { toast,ToastOptions  } from "react-toastify";

interface ShowToastOptions extends Partial<ToastOptions> {
    message: string;
  }

const showToast = ({
  message,
  type = "info",
  position = "top-right",
  autoClose = 2000,
  hideProgressBar = false,
  closeOnClick = true,
  pauseOnHover = true,
  draggable = false,
  progress = undefined,
}:ShowToastOptions & { type?: "success" | "error" | "info"}) => {

  const options:ToastOptions = {
    position: position,
    autoClose: autoClose,
    hideProgressBar: hideProgressBar,
    closeOnClick: closeOnClick,
    pauseOnHover: pauseOnHover,
    draggable: draggable,
    progress: progress,
  };
  switch (type) {
    case "success":
      toast.success(message, options);
      break;
    case "error":
      toast.error(message, options);
      break;
    // case "warn":
    //   toast.warn(message, options);
    //   break;
    case "info":
        toast.info(message,options);
        break;
    default:
      toast.info(message, options);
      break;
  }
};

export default showToast;
