import { toast } from "react-toastify";

const showToast = {
    success: (msg, options = {}) =>
        toast.success(msg, { autoClose: 2500, ...options }),

    error: (msg, options = {}) =>
        toast.error(msg, { autoClose: 3500, ...options }),

    info: (msg, options = {}) =>
        toast.info(msg, { autoClose: 3000, ...options }),

    warning: (msg, options = {}) =>
        toast.warning(msg, { autoClose: 3000, ...options }),

    loading: (msg, options = {}) => {
        // tạo toast loading, trả về id để cập nhật sau
        return toast.loading(msg, {...options });
    },

    updateSuccess: (id, msg, options = {}) => {
        // cập nhật toast loading thành success
        toast.update(id, {
            render: msg,
            type: "success",
            isLoading: false,
            autoClose: 2500,
            ...options,
        });
    },

    updateError: (id, msg, options = {}) => {
        toast.update(id, {
            render: msg,
            type: "error",
            isLoading: false,
            autoClose: 3500,
            ...options,
        });
    },
};

export default showToast;