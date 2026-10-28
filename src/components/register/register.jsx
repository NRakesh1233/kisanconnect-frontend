import './register.css'
import '../navbar/common.css'
import { useRef, useState } from 'react'
import { TextField } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export function Register(){
    let navigate = useNavigate();
    const pic = useRef(null);
    const [isSuccess, setIsSuccess] = useState(false);

    function handleprofilepic(){
       pic.current.click();
    }

    let formik = useFormik({
        initialValues:{
            name:"",
            email:"",
            password:"",
            confirmPassword:"",
            gender:"MALE",
            dateOfBirth:new Date().toISOString().split('T')[0],
            mobileNumber:"",
            role:"",
            village:"",
            district:"",
            state:"",
            pincode:"",
            terms: false
        },
        validationSchema: yup.object({
            name: yup.string().required("Full name is required!"),
            email: yup.string().email("Invalid email format!").required("Email is required!"),
            mobileNumber: yup.string().matches(/^[0-9]{10}$/, "Mobile number must be 10 digits!").required("Mobile number is required!"),
            role: yup.string().required("Please select a role (Customer or Farmer)!"),
            password: yup.string()
                .min(8, "Password must be at least 8 characters!")
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, "Must include uppercase, lowercase, number & special character.")
                .required("Password is required!"),
            confirmPassword: yup.string()
                .oneOf([yup.ref('password'), null], "Passwords must match!")
                .required("Confirm password is required!"),
            village: yup.string().required("Village/City is required!"),
            district: yup.string().required("District is required!"),
            state: yup.string().required("State is required!"),
            pincode: yup.string().matches(/^[0-9]{6}$/, "Pincode must be 6 digits!").required("Pincode is required!"),
            terms: yup.bool().oneOf([true], "You must accept the Terms & Conditions!")
        }),
        onSubmit:(data)=>{
            const { confirmPassword, terms, ...payload } = data;
            console.log(payload);

            axios.post("http://localhost:8080/public/user/register", payload)
            .then((res)=>{
               setIsSuccess(true);
               confetti({
                   particleCount: 120,
                   spread: 70,
                   origin: { y: 0.6 }
               });

               setTimeout(() => {
                   navigate('/login');
               }, 2000);
            })
            .catch((error)=>{
               alert(error.response?.data?.message || "Registration failed")
            })
        }
    })

    return(
    <div className={`register-page shadow-lg ${isSuccess ? 'success-fade-out' : ''}`}>
        
        {/* Success Overlay Animation Box */}
        {isSuccess && (
            <div className="success-overlay-animation flexing flex-column gap-3">
                <div className="success-icon-bounce">
                    <span className="material-symbols-outlined text-success" style={{fontSize: "80px", fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                </div>
                <h2 className="fw-bold text-success">Registration Successful!</h2>
                <p className="text-muted">Welcome to KisanConnect. Redirecting to login...</p>
            </div>
        )}

        {/* Left Side: Form Section */}
        <div className="register-left d-flex align-items-start justify-content-start flex-column gap-4" id='rigister-left'>
            <div className='text-success d-flex align-items-center'> 
                <span className="material-symbols-outlined text-success" style={{fontVariationSettings:"'FILL' 1" }}>eco</span>
                <span className='fs-3 fw-bold ms-2'>KisanConnect</span>
            </div>

            <div>
                <h1 className='fw-bold text-dark fs-2'>Create Your Account</h1>
                <div className='text-success small'>Join KisanConnect and buy or sell fresh farm products.</div>
            </div>

            <div className='register-container flexing flex-column w-100'>
                <form className='w-100' onSubmit={formik.handleSubmit}>
                    
                    {/* Profile Picture Upload */}
                    <div className='d-flex align-items-center gap-3 mb-3'>
                        <div className='profile-pic flexing' onClick={handleprofilepic}>
                            <input type="file" name='profilePic' ref={pic} style={{display:"none"}}/>
                            <span className="material-symbols-outlined fs-1 text-muted">person</span>
                        </div>
                        <div>
                            <span className='text-success fw-bold d-block'>Profile Picture</span>
                            <small className='text-muted'>Click icon to upload photo</small>
                        </div>
                    </div>
                    
                    {/* Role Selection */}
                    <div className='radio-btn d-flex justify-content-between w-100 mt-2 gap-3'>
                        <input type="radio" id='customer' value={"CUSTOMER"} onChange={formik.handleChange} onBlur={formik.handleBlur} name='role'/>
                        <label htmlFor="customer" className='flexing flex-column gap-1 align-items-center text-center'>
                           <span className="material-symbols-outlined d-block text-success">shopping_cart</span>
                           <span className="text-success fw-bold">Customer</span>
                        </label>
                        
                        <input type="radio" id='farmer' value={"FARMER"} onChange={formik.handleChange} onBlur={formik.handleBlur} name='role'/>
                        <label htmlFor="farmer" className='flexing flex-column gap-1 align-items-center text-center'>
                            <span className="material-symbols-outlined d-block text-success">agriculture</span>
                            <span className="text-success fw-bold">Farmer</span>
                        </label>
                    </div>
                    {formik.touched.role && formik.errors.role ? <div className='text-danger small mt-1'>{formik.errors.role}</div> : null}

                    {/* Personal Info Section */}
                    <div className='mt-4'>
                        <div className='fs-6 fw-bold text-success mb-2'>
                           <span>Personal Info</span>
                           <hr className='bg-success mt-1' />
                        </div>
                        <div className='w-100'>
                            <div className='field-container1'>
                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Full Name</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='e.g Rakesh Nakka' name='name' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name} />
                                    </div>
                                    {formik.touched.name && formik.errors.name ? <div className='text-danger small'>{formik.errors.name}</div> : null}
                                </div>

                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Email Address</div>
                                    <div className='field-text'>
                                        <input type="email" placeholder='e.g. user@gmail.com' name='email' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email} />
                                    </div>
                                    {formik.touched.email && formik.errors.email ? <div className='text-danger small'>{formik.errors.email}</div> : null}
                                </div>

                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Mobile Number</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='e.g. 9876543210' name='mobileNumber' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.mobileNumber} maxLength={10} />
                                    </div>
                                    {formik.touched.mobileNumber && formik.errors.mobileNumber ? <div className='text-danger small'>{formik.errors.mobileNumber}</div> : null}
                                </div>

                                <div className='inner-container d-flex gap-2 justify-between'>
                                    <div className='w-50'>
                                        <div className='small text-muted mb-1'>Date of Birth</div>
                                        <div className='field-text d-flex align-items-center'>
                                            <input type='date' className='w-100 bg-transparent border-0 outline-none' name='dateOfBirth' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.dateOfBirth} />
                                        </div>
                                    </div>
                                    <div className='w-50'>
                                        <div className='small text-muted mb-1'>Gender</div>
                                        <div className='field-text dropdown px-2'>
                                            <button className='btn dropdown-toggle w-100 text-start px-0 shadow-none' data-bs-toggle="dropdown" type="button">
                                               {formik.values.gender}
                                            </button>
                                            <ul className='dropdown-menu w-100'>
                                                <li className='dropdown-item' onClick={()=>{formik.setFieldValue("gender","MALE")}}>Male</li>
                                                <li className='dropdown-item' onClick={()=>{formik.setFieldValue("gender","FEMALE")}}>Female</li>
                                                <li className='dropdown-item' onClick={()=>{formik.setFieldValue("gender","OTHERS")}}>Others</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Security Section */}
                    <div className='mt-4'>
                        <div className='fs-6 fw-bold text-success mb-2'>
                           <span>Account Security</span>
                           <hr className='bg-success mt-1' />
                        </div>
                        <div className='w-100'>
                            <div className='field-container1'>
                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Password</div>
                                    <div className='field-text'>
                                        <input type="password" placeholder='e.g. Abc@1234' name='password' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password} />
                                    </div>
                                    {formik.touched.password && formik.errors.password ? <div className='text-danger small'>{formik.errors.password}</div> : null}
                                </div>

                                <div className='inner-container'> 
                                    <div className='small text-muted mb-1'>Confirm Password</div>
                                    <div className='field-text'>
                                        <input type="password" placeholder='e.g. Abc@1234' name='confirmPassword' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.confirmPassword} />
                                    </div>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword ? <div className='text-danger small'>{formik.errors.confirmPassword}</div> : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Details Section */}
                    <div className='mt-4'>
                        <div className='fs-6 fw-bold text-success mb-2'>
                           <span>Location Details</span>
                           <hr className='bg-success mt-1' />
                        </div>
                        <div className='w-100'>
                            <div className='field-container1'>
                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Village / City</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='Village/City' name='village' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.village} />
                                    </div>
                                    {formik.touched.village && formik.errors.village ? <div className='text-danger small'>{formik.errors.village}</div> : null}
                                </div>

                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>District</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='District' name='district' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.district} />
                                    </div>
                                    {formik.touched.district && formik.errors.district ? <div className='text-danger small'>{formik.errors.district}</div> : null}
                                </div>

                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>State</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='State' name='state' onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.state} />
                                    </div>
                                    {formik.touched.state && formik.errors.state ? <div className='text-danger small'>{formik.errors.state}</div> : null}
                                </div>

                                <div className='inner-container'>
                                    <div className='small text-muted mb-1'>Pincode</div>
                                    <div className='field-text'>
                                        <input type="text" placeholder='6 digit Pincode' name='pincode' onChange={formik.handleChange} onBlur={formik.handleBlur} maxLength={6} value={formik.values.pincode} />
                                    </div>
                                    {formik.touched.pincode && formik.errors.pincode ? <div className='text-danger small'>{formik.errors.pincode}</div> : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Actions */}
                    <div className='mt-4'>
                        <div className='d-flex align-items-center'> 
                            <input type="checkbox" name="terms" id="terms" onChange={formik.handleChange} onBlur={formik.handleBlur} checked={formik.values.terms} /> 
                            <label htmlFor="terms" style={{cursor:"pointer"}} className='ms-2 small text-muted'>I agree to <span className='text-success text-decoration-underline'>Terms & Conditions</span></label>
                        </div>
                        {formik.touched.terms && formik.errors.terms ? <div className='text-danger small mt-1'>{formik.errors.terms}</div> : null}

                        <div className='field-text bg-success text-light flexing mt-4 shadow-sm' style={{cursor: 'pointer'}}>
                            <button className='text-light fs-5 fw-bold w-100 h-100 border-0 bg-transparent' type='submit'>Register Account</button>
                        </div>

                        <div className='text-center mt-3 mb-4'>
                            <span className='text-muted small'>Already have an account? </span>
                            <Link to="/login" className='text-success fw-bold text-decoration-none'>Login here</Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        {/* Right Side: Visual Showcase Banner */}
        <div className="register-right d-none d-lg-flex flexing">
            <div className='glass-card w-75 mx-4 p-4 over-card flexing flex-column justify-content-between align-items-start shadow-lg'>
                <h1 className='text-success fw-bold fs-2'>Empowering the Heart of India</h1>
                <div className='px-2 text-success fw-medium fs-6'>
                    Connect directly with quality producers. Experience the transparency of modern agriculture technology, designed for trust and growth.
                </div>
                <div className="d-flex align-items-center">
                    <div className="d-flex">
                        <div className="rounded-circle border border-2 border-white" style={{ width: "40px", height: "40px", backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVCaDx8OkInjnl2xM2lq9FvqSn3SKTqy3NVl06ZDSCRMB8nH9k9pmODAfrADO4GoXSbhA1ZmU1nhLs-pKPt_Z3C48klpgy7q7MAo9fGZHVUIbQhKjeWQU2juUqonLu7ubIf8idn4Dmr24kDM9zQZBzVNlXzPDG2xdZ137M8bh4Hb5GY73PEmAVNzL2wrwQeManlpS-wEM84rFvrN1ZVYUxBZC2KUkoWFniCh6NAVZWpgttO5KS-pM_ktyilgv9bdKEpdG4OFMHpMQ')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                        <div className="rounded-circle border border-2 border-white" style={{ width: "40px", height: "40px", marginLeft: "-10px", backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk91R2Bxx2-ZU7ISEKVCSFu8w_QXCAcL_34GP-P9smVhkuvjGexZl9pGsVXAekfVEfhZXs2ij02lc5ZW-6awCrzXWk3U__SxrGLTwoafoWAWZ8afblt3i43mIO0DZAIQhQR05iFuOIp8g0fOApGwwdUONjvl5L8aEOp3L22NK36PVlruHyunTwXzfli8LQtWsdYLlkghfsUM8soHSp0NPrVNd3CD5ngGknCvjd0I0YUZXC9QKhUD3r8uxrpSlAavP9RQKVsg9DKJc')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                        <div className="rounded-circle border border-2 border-white" style={{ width: "40px", height: "40px", marginLeft: "-10px", backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAjRP0LkMhx3scNCxQKOSUNCYvMWfKndW74Ub_YqOtN7kpsb4whBrKEMXMR9pEgVPMeZFgvttadzpsOhdNyAJ4p7nsmT_Q0CyDnqSUTp6N8wprmBJErsYpS3PZTYinVh_6BXwPi2ij2KAQB3T1UTXmkuTB9yWeuvUoOiZEW9_JNqKPbiaNGu1lF6M9Ju3b2C6DHdnJ2J1UhyutWvNfd2IEkhtsEC3odqBn5ZhwPxjxlY7Asb3kOxSlHU2FD_kO8-cVdtcQ6p8T6Od4')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
                    </div>
                    <span className="ms-3 text-success fw-bold small">
                        Join 10k+ Farmers &amp; Customers
                    </span>
                </div>
            </div>
        </div>
    </div>)
}