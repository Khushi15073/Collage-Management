import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signUser } from "../features/authSlice";
import type { RootState, AppDispatch } from "../app/store";

interface SignupForm {
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other" | "";
    password: string;
    confirmPassword: string;
}

const Signup: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [form, setForm] = useState<SignupForm>({
        name: "",
        email: "",
        phoneNumber: "",
        gender: "",
        password: "",
        confirmPassword: "",
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidationError(null);

        if (form.password !== form.confirmPassword) {
            setValidationError("Passwords do not match");
            return;
        }


        if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
            setValidationError("Please provide a valid 10-digit phone number");
            return;
        }

        if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(form.name)) {
            setValidationError("Please provide a valid name");
            return;
        }

        const { confirmPassword, ...payload } = form;

        const result = await dispatch(signUser(payload as any));
        if (signUser.fulfilled.match(result)) {
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white w-[600px] p-10 rounded-xl shadow-lg text-center">


                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-blue-600 text-white text-2xl rounded-xl">
                    🎓
                </div>


                <h2 className="text-xl font-semibold">College Management System</h2>
                <p className="text-sm text-gray-500 mb-6">Create your account</p>

                <form onSubmit={handleSubmit}>


                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>


                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="your.email@college.edu"
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>


                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Phone Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={form.phoneNumber}
                            onChange={handleChange}
                            placeholder="10-digit phone number"
                            maxLength={10}
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Gender</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                        >
                            <option value="" disabled>Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>


                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>


                    <div className="text-left mb-4">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            className="w-full mt-1 px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {validationError && (
                        <p className="text-red-500 text-sm mb-2">{validationError}</p>
                    )}
                    {error && (
                        <p className="text-red-500 text-sm mb-2">{error}</p>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-black text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>

                </form>


                <p className="text-sm text-gray-500 mt-4">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/")}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Sign In
                    </button>
                </p>

            </div>
        </div>
    );
};

export default Signup;