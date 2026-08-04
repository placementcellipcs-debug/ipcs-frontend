import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, Users, Eye, EyeSlash, X } from '@phosphor-icons/react';
import Cropper from 'react-easy-crop';
import axios from 'axios';


function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState(null);
 
  const [showTncModal, setShowTncModal] = useState(false);
  const [tncScrolled, setTncScrolled] = useState(false);
  const [tncAccepted, setTncAccepted] = useState(false);


  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [finalPhotoBase64, setFinalPhotoBase64] = useState('');


  const [qualSelect, setQualSelect] = useState('');
  const [streamSelect, setStreamSelect] = useState('');
  const [qualOther, setQualOther] = useState('');
  const [streamOther, setStreamOther] = useState('');


  const [formData, setFormData] = useState({
    rollNo: '', name: '', phone: '', email: '', age: '', gender: '', branch: '',
    course: '', joiningDate: '', fresherStatus: '', homeTown: '',
    linkedin: '', instagram: '', placementReq: '', parentName: '', parentContact: '',
    friend1Name: '', friend1Phone: '', friend2Name: '', friend2Phone: '', password: '', confirmPassword: ''
  });


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageSrc(reader.result); setShowCropModal(true); });
      reader.readAsDataURL(file);
    }
  };


  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);


  const generateCroppedImage = () => {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      canvas.width = 250; canvas.height = 250;
      const ctx = canvas.getContext('2d');
      ctx.drawImage( image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, 250, 250 );
      setFinalPhotoBase64(canvas.toDataURL('image/jpeg'));
      setShowCropModal(false);
    };
  };


  const handleTncScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 25;
    if (bottom) setTncScrolled(true);
  };


  const handleSignup = async (e) => {
    e.preventDefault();
   
    // VALIDATIONS
    if (formData.password !== formData.confirmPassword) { setStatus({ type: 'error', message: 'Passwords do not match!' }); return; }
    if (formData.friend1Name.trim().toLowerCase() === formData.friend2Name.trim().toLowerCase()) { setStatus({ type: 'error', message: 'Friend 1 and Friend 2 cannot have the same name.' }); return; }
    if (formData.friend1Phone.trim() === formData.friend2Phone.trim()) { setStatus({ type: 'error', message: 'Friend 1 and Friend 2 cannot have the same contact number.' }); return; }
    if (formData.phone.trim() === formData.parentContact.trim()) { setStatus({ type: 'error', message: 'Parent contact number cannot be the same as your phone number.' }); return; }
    if (!tncAccepted) { setStatus({ type: 'error', message: 'You must accept the Terms & Conditions.' }); return; }


    setStatus({ type: 'info', message: 'Uploading photo & registering account...' });
    const finalQual = qualSelect === 'Other' ? qualOther : qualSelect;
    const finalStream = streamSelect === 'Other' ? streamOther : streamSelect;


    const payload = { ...formData, photoBase64: finalPhotoBase64, qualification: finalQual, stream: finalStream };


    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', payload);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Account created! Redirecting to login...' });
        setTimeout(() => navigate('/'), 2500);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.message || 'Server Error.' });
    }
  };


  return (
    <div className="auth-wrapper">
      <div className="profile-reg-card">
        <div className="reg-header">
          <div><h2 style={{ margin: '0 0 4px 0' }}>Create Student Profile</h2><p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Register records, course details, and placement preferences</p></div>
        </div>


        <form onSubmit={handleSignup}>
          {/* PRIMARY DETAILS */}
          <div className="section-title" style={{ color: '#38bdf8' }}><User size={20} /> PRIMARY DETAILS</div>
          <div className="primary-layout-row">
            <div className="avatar-upload-box" onClick={() => document.getElementById('photoUpload').click()}>
              <input type="file" id="photoUpload" accept="image/*" className="hidden" onChange={onFileChange} />
              <div className="avatar-preview-circle">{finalPhotoBase64 ? <img src={finalPhotoBase64} alt="Profile" /> : (formData.name ? formData.name.charAt(0).toUpperCase() : 'U')}</div>
              <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>Tap to Upload</span>
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="grid-2col">
                <div className="form-group" style={{ marginBottom: 0 }}><label>IPCS Roll Number *</label><input type="text" name="rollNo" placeholder="IPCS XXXXXX" onChange={handleChange} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Full Name *</label><input type="text" name="name" placeholder="e.g. Vishnu Kumar" onChange={handleChange} required /></div>
              </div>
              <div className="grid-2col">
                <div className="form-group" style={{ marginBottom: 0 }}><label>Phone Number *</label><input type="tel" name="phone" placeholder="+91 9876543210" onChange={handleChange} required /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><label>Email ID *</label><input type="email" name="email" placeholder="student@ipcsglobal.com" onChange={handleChange} required /></div>
              </div>
            </div>
          </div>


          <div className="grid-3col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Age</label><input type="number" name="age" placeholder="e.g. 22" onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Gender</label>
              <select name="gender" onChange={handleChange} defaultValue="">
                <option value="" disabled>Select</option><option value="Male">Male</option><option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Branch Campus *</label>
              <select name="branch" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Branch</option>
                <optgroup label="Kerala"><option value="Kochi">Kochi</option><option value="Calicut">Calicut</option><option value="Trivandrum">Trivandrum</option><option value="Attingal">Attingal</option><option value="Kollam">Kollam</option><option value="Kannur">Kannur</option><option value="Thrissur">Thrissur</option><option value="Perinthalmanna">Perinthalmanna</option><option value="Kottayam">Kottayam</option><option value="Pathanamthitta">Pathanamthitta</option><option value="Palakkad">Palakkad</option></optgroup>
                <optgroup label="Tamil Nadu"><option value="Coimbatore">Coimbatore</option><option value="Chennai">Chennai</option><option value="Tambaram">Tambaram</option><option value="Trichy">Trichy</option><option value="Salem">Salem</option><option value="Madurai">Madurai</option><option value="Erode">Erode</option><option value="Tirunelveli">Tirunelveli</option></optgroup>
                <optgroup label="Karnataka"><option value="Bangalore">Bangalore</option><option value="Mangalore">Mangalore</option><option value="Mysore">Mysore</option></optgroup>
                <optgroup label="Maharashtra"><option value="Mumbai">Mumbai</option><option value="Pune">Pune</option><option value="Nagpur">Nagpur</option></optgroup>
                <optgroup label="West Bengal"><option value="Kolkata">Kolkata</option><option value="Siliguri">Siliguri</option></optgroup>
                <optgroup label="Other States in India"><option value="Telangana: Hyderabad">Telangana: Hyderabad</option><option value="Jharkhand: Ranchi">Jharkhand: Ranchi</option><option value="Chhattisgarh: Raipur">Chhattisgarh: Raipur</option><option value="Madhya Pradesh: Bhopal">Madhya Pradesh: Bhopal</option></optgroup>
                <optgroup label="GCC (International)"><option value="Dubai (UAE)">Dubai (UAE)</option><option value="Riyadh (Saudi Arabia)">Riyadh (Saudi Arabia)</option></optgroup>
              </select>
            </div>
          </div>


          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Parent/Guardian Name</label><input type="text" name="parentName" placeholder="Full Name" onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Parent Contact No.</label><input type="tel" name="parentContact" placeholder="+91 XXXXXXXXXX" onChange={handleChange} /></div>
          </div>


          {/* ACADEMIC DETAILS */}
          <div className="section-title" style={{ color: '#4ade80', marginTop: '2rem' }}><GraduationCap size={20} /> ACADEMIC & COURSE DETAILS</div>
          <div className="grid-3col">
            <div className="form-group" style={{ marginBottom: 0 }}><label>Course Category *</label>
              <select name="course" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Course Category</option><option value="Industrial Automation">Industrial Automation</option><option value="BMS & CCTV">BMS & CCTV</option><option value="Embedded and IOT">Embedded and IOT</option><option value="Python and Data Science">Python and Data Science</option><option value="Artificial Intelligence">Artificial Intelligence</option><option value="Python Full Stack">Python Full Stack</option><option value="Java Full Stack">Java Full Stack</option><option value="MERN Stack">MERN Stack</option><option value="Software Testing">Software Testing</option><option value="Digital Marketing">Digital Marketing</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Joining Date *</label><input type="date" name="joiningDate" onChange={handleChange} required /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Qualification *</label>
              <select onChange={(e) => setQualSelect(e.target.value)} defaultValue="" required>
                <option value="" disabled>Select Qualification</option><option value="SSLC">SSLC</option><option value="HSE">HSE</option><option value="ITI">ITI</option><option value="Diploma">Diploma</option><option value="B.Tech">B.Tech</option><option value="Bsc">Bsc</option><option value="PG">PG</option><option value="Other">Other</option>
              </select>
              {qualSelect === 'Other' && <input type="text" placeholder="Please specify qualification" style={{ marginTop: '8px' }} onChange={(e) => setQualOther(e.target.value)} required />}
            </div>
          </div>


          <div className="grid-3col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Stream / Branch *</label>
              <select onChange={(e) => setStreamSelect(e.target.value)} defaultValue="" required>
                <option value="" disabled>Select Stream</option><option value="IT">IT</option><option value="EEE">EEE</option><option value="EC">EC</option><option value="Mechanical">Mechanical</option><option value="Science">Science</option><option value="Other">Other</option>
              </select>
              {streamSelect === 'Other' && <input type="text" placeholder="Please specify stream" style={{ marginTop: '8px' }} onChange={(e) => setStreamOther(e.target.value)} required />}
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Experience Status *</label>
              <select name="fresherStatus" onChange={handleChange} defaultValue="" required>
                <option value="" disabled>Select Status</option><option value="Fresher">Fresher</option><option value="Experienced">Experienced</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Home Town *</label><input type="text" name="homeTown" placeholder="e.g. Kozhikode" onChange={handleChange} required /></div>
          </div>


          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>LinkedIn Link</label><input type="text" name="linkedin" placeholder="www.linkedin.com/in/..." onChange={handleChange} /></div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Instagram Handle</label><input type="text" name="instagram" placeholder="@username" onChange={handleChange} /></div>
          </div>
          <div className="form-group" style={{ marginTop: '1.1rem' }}><label>Placement Requirements</label><textarea name="placementReq" rows="2" placeholder="Preferred location, salary expectation..." onChange={handleChange}></textarea></div>


          {/* REFERRALS & SECURITY */}
          <div className="section-title" style={{ color: '#c084fc', marginTop: '2rem' }}><Users size={20} /> REFERRALS & SECURITY CREDENTIALS</div>
          <div className="grid-2col">
            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>FRIEND 1 REFERRAL *</span>
              <input type="text" name="friend1Name" placeholder="Full Name" style={{ marginBottom: '0.6rem' }} onChange={handleChange} required />
              <input type="tel" name="friend1Phone" placeholder="10-digit Contact Number" onChange={handleChange} required />
            </div>
            <div style={{ background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--input-border)' }}>
              <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 700, display: 'block', marginBottom: '0.6rem' }}>FRIEND 2 REFERRAL *</span>
              <input type="text" name="friend2Name" placeholder="Full Name" style={{ marginBottom: '0.6rem' }} onChange={handleChange} required />
              <input type="tel" name="friend2Phone" placeholder="10-digit Contact Number" onChange={handleChange} required />
            </div>
          </div>


          <div className="grid-2col" style={{ marginTop: '1.1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Password *</label>
              <div className="pwd-wrapper">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Create account password" onChange={handleChange} required />
                <span className="pwd-toggle" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <Eye size={20} /> : <EyeSlash size={20} />}</span>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}><label>Confirm Password *</label>
              <div className="pwd-wrapper"><input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter password" onChange={handleChange} required /></div>
            </div>
          </div>


          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <input type="checkbox" style={{ width: 'auto', cursor: tncAccepted ? 'pointer' : 'not-allowed' }} checked={tncAccepted} disabled={!tncAccepted} onChange={(e) => setTncAccepted(e.target.checked)} />
            <label style={{ margin: 0, fontSize: '0.82rem', textTransform: 'none' }}>
              I have read and accepted the <span className="tnc-link" onClick={() => setShowTncModal(true)}>Terms & Conditions</span>
            </label>
          </div>


          {status && <div className={`alert alert-${status.type}`}>{status.message}</div>}


          <div className="form-footer-bar">
            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn-action" style={{ padding: '0.8rem 2rem', background: '#2563eb' }}>Create Account &rarr;</button>
          </div>
        </form>
      </div>


      {/* CROP MODAL */}
      {showCropModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Adjust Profile Photo</h3>
              <X size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowCropModal(false)} />
            </div>
            <div style={{ position: 'relative', width: '100%', height: '250px', background: '#333', borderRadius: '12px', overflow: 'hidden' }}>
              <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ margin: '20px 0', width: '100%' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-action" style={{ flex: 1, background: '#22c55e' }} onClick={generateCroppedImage}>Confirm Photo</button>
            </div>
          </div>
        </div>
      )}


      {/* EXACT T&C MODAL */}
      {showTncModal && (
        <div className="report-modal-overlay">
          <div className="report-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header-border">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>IPCS Placement Rule Set</h3>
              <X size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowTncModal(false)} />
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 0 }}>Below mentioned are the Rules to be followed by students for getting Placement Support from IPCS. Please scroll to the bottom to accept.</p>
            <div className="tnc-content-box" onScroll={handleTncScroll}>
              <h4>ELIGIBILITY CRITERIA FOR ATTENDING THE INTERVIEWS</h4>
              <ul>
                <li>Students who have completed at least 90% of the course (certain companies want candidates immediately in such case you should be in a position to join immediately).</li>
                <li>Students who have paid the full fees.</li>
                <li>Students who have passion for working & take their career seriously.</li>
                <li>Candidates should be ready for any location (exemption only for female students).</li>
              </ul>
              <h4>DOS & DON’TS FOR THE CANDIDATES</h4>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>During Job applications & Interview:</strong>
              <ul>
                <li>Check all criteria mentioned in the employment news, if everything suits to you then only APPLY to the mentioned company.</li>
                <li>Students should attend the interview on the date and time as allotted by the recruiter.</li>
                <li>It is mandatory for Students to update the placement coordinator of their attendance in the interviews. If they are not updating their attendance they will not be allowed for the next interview.</li>
                <li>Students attending the interview and not getting selected is not a problem. Losing in an interview is not a criteria for further interviews.</li>
                <li>Students who are not attending the 3 interviews even after their acceptance to attend the interviews will be barred to attend any further interviews and name will be removed from Placement Support.</li>
                <li>Once enrolled for Placement Support, we expect to student to apply for all companies, if a student not applying to any company for more than 15 days with a valid reason will be removed from Placement Support.</li>
              </ul>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '8px', marginTop: '10px' }}>During Joining:</strong>
              <ul>
                <li>Students can take time to accept or reject the company’s offer but keep the Placement Team and the recruiter updated of their intentions.</li>
                <li>Students after being selected & given a date to join should adhere to that. No excuses will be accepted thereafter.</li>
                <li>Students who are not joining after being selected by a recruiter will have to justify why he/she has not joined. Without an apt reason there won’t be more chances.</li>
                <li>2 times after accepting the offer and not joining will be considered as Black Mark and such student will be barred and name will be removed from Placement Support.</li>
                <li>1 year commitment to the company getting recruited is mandatory.</li>
                <li>If anyone joining and getting absconded from work without informing employer will be removed from our Placement Support.</li>
                <li>There will not be any commitment on Basic Salary /Work Location or other facilities - Candidate has to abide the HR policies set by the hiring company.</li>
              </ul>
              <h4>Promotional Use of Student Media</h4>
              <p style={{ marginTop: 0, marginBottom: '20px' }}>Photos and videos of the student taken by IPCS after successful placement may be used by the organization for promotional purposes. By participating in the placement process, the student gives consent for IPCS to use such media across platforms including social media, websites, brochures, and other official materials.</p>
              <h4>DECLARATION</h4>
              <p style={{ marginTop: 0 }}>I hereby declare that I have read & understood the terms & conditions of IPCS Placement Cell. I adhere to follow the rules & incase of any failure to do so; I understand that I won’t be eligible for Placement Support & it will be completely my sole responsibility.</p>
            </div>
            {!tncScrolled ? (
              <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '0.88rem', fontWeight: 700, marginTop: '15px' }}>↓ Please scroll to the end of the rules to Accept ↓</div>
            ) : (
              <div style={{ display: 'flex', marginTop: '20px' }}>
                <button type="button" className="btn-action" style={{ width: '100%', background: '#22c55e' }} onClick={() => { setTncAccepted(true); setShowTncModal(false); }}>Accept</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default Signup;