// --- NEW PLACEMENT DRIVE STATES ---
  const [activeDrives, setActiveDrives] = useState([]);
  const [currentDrivePopup, setCurrentDrivePopup] = useState(null);
  const [driveActionStatus, setDriveActionStatus] = useState(null);
  
  // --- PUSH NOTIFICATION STATE ---
  const [pushPermission, setPushPermission] = useState(Notification.permission);

  // --- STUDY MATERIAL STATES ---
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [studyMatStatus, setStudyMatStatus] = useState(null);
  const [materialModal, setMaterialModal] = useState(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // Request Push Notification Permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setPushPermission(permission);
      });
    }
  }, []);

  // Utility to send Push Notifications
  const sendPushNotification = (title, body, icon = GLOBAL_LOGO_URL) => {
    if (pushPermission === 'granted') {
      new Notification(title, { body, icon });
    }
  };

  // Fetch active drives & Handle 1-hour Snooze
  useEffect(() => {
    // 1. Filter drives from the fetched data
    if (data.events && data.events.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const drives = data.events.filter(ev => {
        if (ev.Event !== 'Placement Drive') return false; // Filter only Placement Drives
        const driveDate = new Date(ev['Date of the Event']);
        return driveDate >= today; // Only upcoming or today
      });
      setActiveDrives(drives);
    }
  }, [data.events]);

  useEffect(() => {
    // 2. Interval to check for popups every 1 minute
    const checkDrives = setInterval(() => {
      if (activeDrives.length === 0 || currentDrivePopup) return;

      const respondedDrives = JSON.parse(localStorage.getItem('talentino_drive_responses') || '{}');
      const snoozedDrives = JSON.parse(localStorage.getItem('talentino_drive_snoozes') || '{}');

      // Find the first drive the user hasn't responded to, and isn't currently snoozed
      const driveToShow = activeDrives.find(drive => {
        const driveId = drive['Drive ID'];
        if (respondedDrives[driveId]) return false; // Already registered or not interested

        const snoozeTime = snoozedDrives[driveId];
        if (snoozeTime) {
          const hoursPassed = (Date.now() - snoozeTime) / (1000 * 60 * 60);
          if (hoursPassed < 1) return false; // Still within 1 hour snooze
        }
        return true;
      });

      if (driveToShow) {
        setCurrentDrivePopup(driveToShow);
        sendPushNotification(
          "New Placement Drive!", 
          `${driveToShow.Title} is happening at ${driveToShow.Branch}. Tap to view.`
        );
      }
    }, 5000); // Checks 5 seconds after load, then every 5 seconds if closed

    return () => clearInterval(checkDrives);
  }, [activeDrives, currentDrivePopup, pushPermission]);

  const handleDriveDismiss = () => {
    // Snooze for 1 hour
    const driveId = currentDrivePopup['Drive ID'];
    const snoozedDrives = JSON.parse(localStorage.getItem('talentino_drive_snoozes') || '{}');
    snoozedDrives[driveId] = Date.now();
    localStorage.setItem('talentino_drive_snoozes', JSON.stringify(snoozedDrives));
    setCurrentDrivePopup(null);
  };

  const handleDriveResponse = async (status) => {
    // status = 'Registered' or 'Not Interested'
    setDriveActionStatus({ type: 'info', message: 'Recording your response...' });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/dashboard/drive-response`, {
        driveId: currentDrivePopup['Drive ID'],
        title: currentDrivePopup['Title'],
        name: user.name,
        phone: user.phone,
        email: user.email,
        course: user.course,
        branch: user.branch,
        resume: user.resume,
        qualification: user.qualification,
        status: status, // 'Registered' or 'Not Interested'
        tpoBranch: currentDrivePopup['Branch'] // To CC the right TPO
      });

      if (res.data.success) {
        // Save to local storage so it never shows again
        const respondedDrives = JSON.parse(localStorage.getItem('talentino_drive_responses') || '{}');
        respondedDrives[currentDrivePopup['Drive ID']] = status;
        localStorage.setItem('talentino_drive_responses', JSON.stringify(respondedDrives));
        
        if (status === 'Registered') {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }

        setCurrentDrivePopup(null);
        setDriveActionStatus(null);
      }
    } catch (err) {
      setDriveActionStatus({ type: 'error', message: 'Failed to record response. Please try again.' });
    }
  };

  {/* PLACEMENT DRIVE POPUP MODAL */}
      {currentDrivePopup && (
        <div className="report-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="report-card" style={{ maxWidth: '500px', padding: '0', overflow: 'hidden', position: 'relative' }}>
            
            {/* Close Button (Snoozes for 1 hr) */}
            <div 
                style={{ position: 'absolute', top: '15px', right: '15px', width: '32px', height: '32px', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                onClick={handleDriveDismiss}
            >
                <i className="ph ph-x" style={{ color: '#fff', fontSize: '1.2rem' }}></i>
            </div>

            {/* Poster Image */}
            <div style={{ width: '100%', height: '280px', background: 'var(--bg-dark)' }}>
              {currentDrivePopup['Poster Link'] ? (
                <img src={getDriveImageUrl(currentDrivePopup['Poster Link'])} alt="Drive Poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #311042)', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>
                  Placement Drive
                </div>
              )}
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                 <div>
                    <div style={{ color: 'var(--accent-purple)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>Drive ID: {currentDrivePopup['Drive ID']}</div>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{currentDrivePopup['Title']}</h2>
                 </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'var(--input-bg)', padding: '15px', borderRadius: '12px', border: '1px solid var(--input-border)', marginBottom: '1.5rem' }}>
                <div><strong style={{ display:'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform:'uppercase' }}>Date</strong><span style={{ color: '#fff', fontWeight: 600 }}>{currentDrivePopup['Date of the Event']}</span></div>
                <div><strong style={{ display:'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform:'uppercase' }}>Time</strong><span style={{ color: '#fff', fontWeight: 600 }}>{currentDrivePopup['Time of the Event']}</span></div>
                <div style={{ gridColumn: '1 / -1' }}><strong style={{ display:'block', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform:'uppercase' }}>Location</strong><span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{currentDrivePopup['Event Hapening in']}</span></div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>{currentDrivePopup['Description']}</p>

              {driveActionStatus && <div className={`alert alert-${driveActionStatus.type}`} style={{ marginBottom: '15px' }}>{driveActionStatus.message}</div>}

              <div style={{ display: 'flex', gap: '15px' }}>
                <button className="btn-cancel" style={{ flex: 1, padding: '1rem', border: '1px solid #ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => handleDriveResponse('Not Interested')}>
                  Not Interested
                </button>
                <button className="btn-action" style={{ flex: 2, padding: '1rem', background: '#22c55e' }} onClick={() => {
                    if (!user.resume || user.resume === "N/A") {
                        setDriveActionStatus({ type: 'error', message: 'You must upload a resume in your Profile before registering!' });
                    } else {
                        handleDriveResponse('Registered');
                    }
                }}>
                  Register Now &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}