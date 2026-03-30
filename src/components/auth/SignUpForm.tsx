"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { apiCreateOTP, apiSignUp, apiVerifyOTP } from "@/service/auth";
import Link from "next/link";
import { useState } from "react";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // State quản lý form và luồng
  const [step, setStep] = useState(1); // 1: Đăng ký, 2: Nhập OTP
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm handle thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(""); // Xoá lỗi khi user gõ lại
  };

  // Hàm validate email
  const isValidEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Xử lý khi bấm nút Sign Up (Step 1)
  const handleSignUpClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate cơ bản
    if (!formData.fname || !formData.lname || !formData.email || !formData.password) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setErrorMsg("Email không đúng định dạng.");
      return;
    }

    try {
      setLoading(true);
      // Gọi hàm CREATEOTP
      await apiCreateOTP(formData.email);
      // Nếu thành công, chuyển sang màn hình OTP
      setStep(2);
    } catch (error) {
      setErrorMsg("Lỗi khi tạo OTP. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi xác nhận OTP (Step 2)
  const handleVerifyOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!otp) {
      setErrorMsg("Vui lòng nhập OTP.");
      return;
    }

    try {
      setLoading(true);
      
      const verifyRes = await apiVerifyOTP(formData.email, otp);

      const tokenId = verifyRes?.data?.token_id; 
      if (!tokenId) {
        throw new Error("OTP không hợp lệ hoặc không có token_id");
      }

      const signupPayload = {
        display_name: `${formData.fname} ${formData.lname}`.trim(),
        email: formData.email,
        password: formData.password,
        token_id: tokenId,
      };

      const signupRes = await apiSignUp(signupPayload);
      
      console.log("Đăng ký thành công!", signupRes);
      alert("Đăng ký thành công! Đang chuyển hướng...");

      window.location.href = '/signin'; // Chuyển hướng người dùng

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Xác thực OTP hoặc đăng ký thất bại.";
      setErrorMsg(errorMessage || "Xác thực OTP hoặc đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {step === 1 ? "Sign Up" : "Verify OTP"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 1 
                ? "Enter your email and password to sign up!" 
                : `We sent an OTP to ${formData.email}. Please check your email and enter it below.`}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-error-500 bg-error-50 p-3 rounded">
              {errorMsg}
            </div>
          )}

          {/* ----- STEP 1: FORM SIGN UP ----- */}
          {step === 1 && (
            <>
              {/* Các nút đăng ký Social (Bỏ qua xử lý logic trong ví dụ này) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
                {/* ... (Giữ nguyên các nút Sign up with Google / X của bạn) ... */}
                <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  {/* Icon Google */}
                  Sign up with Google
                </button>
                <button className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg px-7 hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10">
                  {/* Icon X */}
                  Sign up with X
                </button>
              </div>
              <div className="relative py-3 sm:py-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                    Or
                  </span>
                </div>
              </div>

              <form onSubmit={handleSignUpClick}>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* First Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        First Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="fname"
                        defaultValue={formData.fname}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    {/* Last Name */}
                    <div className="sm:col-span-1">
                      <Label>
                        Last Name<span className="text-error-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="lname"
                        defaultValue={formData.lname}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label>
                      Email<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="email"
                      name="email"
                      defaultValue={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <Label>
                      Password<span className="text-error-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        name="password"
                        defaultValue={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                      >
                        {showPassword ? (
                          <span className="fill-gray-500 dark:fill-gray-400">
                            <EyeIcon />
                          </span>
                        ) : (
                          <span className="fill-gray-500 dark:fill-gray-400">
                            <EyeCloseIcon />
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className="flex items-center gap-3">
                    <Checkbox
                      className="w-5 h-5"
                      checked={isChecked}
                      onChange={setIsChecked}
                    />
                    <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                      By creating an account means you agree to the{" "}
                      <span className="text-gray-800 dark:text-white/90">
                        Terms and Conditions,
                      </span>{" "}
                      and our{" "}
                      <span className="text-gray-800 dark:text-white">
                        Privacy Policy
                      </span>
                    </p>
                  </div>

                  {/* Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={!isChecked || loading}
                      className={`flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs 
                        ${!isChecked ? "opacity-50 cursor-not-allowed" : "hover:bg-brand-600"}`}
                    >
                      {loading ? "Processing..." : "Sign Up"}
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* ----- STEP 2: FORM NHẬP OTP ----- */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtpSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    OTP Code<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    name="otp"
                    defaultValue={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter the 6-digit code"
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center w-1/3 px-4 py-3 text-sm font-medium text-gray-700 transition rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-2/3 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                  >
                    {loading ? "Verifying..." : "Verify & Register"}
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}