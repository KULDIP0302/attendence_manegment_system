import axios from 'axios';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

// 🔥 Base URL with fallback
const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        let result;
        if (role === 'Teacher') {
            try {
                result = await axios.post(
                    `${BASE_URL}/api/auth/login`,
                    { ...fields, role: 'teacher' },
                    { headers: { 'Content-Type': 'application/json' } }
                );
            } catch (teacherApiError) {
                // Backward compatibility: if new endpoint is unavailable, use legacy teacher login.
                if (teacherApiError?.response?.status === 404) {
                    result = await axios.post(
                        `${BASE_URL}/TeacherLogin`,
                        fields,
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                } else {
                    throw teacherApiError;
                }
            }
        } else {
            result = await axios.post(`${BASE_URL}/${role}Login`, fields, {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        const apiMessage = error?.response?.data?.message || error?.message || 'Network Error';
        dispatch(authError(apiMessage));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await axios.post(`${BASE_URL}/${role}Reg`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded(result.data));
        }
        else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        console.log("REGISTER ERROR:", error.response || error.message);
        dispatch(authError(error));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${BASE_URL}/${address}/${id}`);

        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        console.log("GET ERROR:", error.response || error.message);
        dispatch(getError(error));
    }
};

// ✅ 🔥 DELETE FIXED
export const deleteUser = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const url = `${BASE_URL}/${address}/${id}`;
        console.log("DELETE API:", url);

        const result = await axios.delete(url);

        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getDeleteSuccess());
        }
    } catch (error) {
        console.log("DELETE ERROR:", error.response || error.message);
        dispatch(getError(error));
    }
};

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        console.log("UPDATE ERROR:", error.response || error.message);
        dispatch(getError(error));
    }
};

// ✅ 🔥 ADD (already correct)
export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const url = `${BASE_URL}/${address}Create`;
        console.log("ADD API:", url);

        const result = await axios.post(url, fields, {
            headers: { 'Content-Type': 'application/json' },
        });

        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        console.log("ADD ERROR:", error.response || error.message);
        dispatch(authError(error));
    }
};