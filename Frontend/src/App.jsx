import { useState, useEffect } from "react";
import API_BASE_URL from "./services/api";
import "./App.css";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Registration states
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerRole, setRegisterRole] = useState("PATIENT");

  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [aboutDoctor, setAboutDoctor] = useState("");

  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("docspotToken")),
  );
  const [doctors, setDoctors] = useState([]);
  const [showDoctors, setShowDoctors] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Doctor Dashboard
  const [doctorAppointments, setDoctorAppointments] = useState([]);
  const [showDoctorAppointments, setShowDoctorAppointments] = useState(false);
  const [isLoadingDoctorAppointments, setIsLoadingDoctorAppointments] =
    useState(false);

  const [doctorAppointmentsError, setDoctorAppointmentsError] = useState("");

  // Doctor Availability
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [availabilityStartTime, setAvailabilityStartTime] = useState("09:00");
  const [availabilityEndTime, setAvailabilityEndTime] = useState("20:00");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("docspotToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const data = await response.json();

        console.log("Loaded profile:", data);

        setProfile(data);
        setUserRole(data.role);

        // Load doctor ID when logged-in user is a doctor
        if (data.role === "DOCTOR") {
          const doctorResponse = await fetch(
            `${API_BASE_URL}/doctors/user/${data.id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!doctorResponse.ok) {
            throw new Error("Unable to fetch doctor profile");
          }

          const doctorData = await doctorResponse.json();

          console.log("Loaded doctor profile:", doctorData);

          setDoctorProfile(doctorData);
          setDoctorId(doctorData.id);
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      const token = localStorage.getItem("docspotToken");

      if (!token || !profile?.id) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/user/${profile.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load notifications");
        }

        const data = await response.json();

        console.log("Loaded notifications:", data);

        setNotifications(data);
      } catch (error) {
        console.error("Notification loading error:", error);
      }
    };

    loadNotifications();
  }, [profile]);

  const handleSaveAvailability = async () => {
    if (!doctorId) {
      setAvailabilityMessage("Doctor profile not found.");
      return;
    }

    if (availableDays.length === 0) {
      setAvailabilityMessage("Please select at least one day.");
      return;
    }

    if (!availabilityStartTime || !availabilityEndTime) {
      setAvailabilityMessage("Please select start and end time.");
      return;
    }

    setIsSavingAvailability(true);
    setAvailabilityMessage("");

    try {
      const token = localStorage.getItem("docspotToken");

      const params = new URLSearchParams();

      params.append("doctorId", doctorId);
      params.append("availableDays", availableDays.join(","));
      params.append("startTime", availabilityStartTime);
      params.append("endTime", availabilityEndTime);

      const response = await fetch(
        `${API_BASE_URL}/weekly-schedule/bulk?${params.toString()}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.text();

      console.log("Availability status:", response.status);
      console.log("Availability response:", data);

      if (!response.ok) {
        throw new Error(data || "Unable to save availability");
      }

      setAvailabilityMessage("Availability saved successfully! 🎉");
    } catch (error) {
      console.error("Availability save error:", error);
      setAvailabilityMessage(error.message);
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleViewDoctorAppointments = async () => {
    setIsLoadingDoctorAppointments(true);
    setDoctorAppointmentsError("");

    if (!doctorId) {
      setDoctorAppointmentsError("Doctor profile not found");
      setIsLoadingDoctorAppointments(false);
      return;
    }

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/appointments/doctor/${doctorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to fetch doctor appointments");
      }

      const data = await response.json();

      console.log("Doctor ID:", doctorId);
      console.log("Doctor appointments:", data);

      setDoctorAppointments(data);
      setShowDoctorAppointments(true);
    } catch (error) {
      setDoctorAppointmentsError(error.message);
    } finally {
      setIsLoadingDoctorAppointments(false);
    }
  };
  const handleUpdateAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: status,
          }),
        },
      );

      const data = await response.text();

      console.log("Status update response:", data);

      if (!response.ok) {
        throw new Error(data || "Unable to update appointment status");
      }

      alert(
        status === "CONFIRMED"
          ? "Appointment confirmed successfully!"
          : "Appointment cancelled successfully!",
      );

      await handleViewDoctorAppointments();
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    }
  };

  // const [userRole, setUserRole] = useState("");
  // const [doctorId, setDoctorId] = useState(null);
  const handleLogin = async (event) => {
    event.preventDefault();

    setIsLoggingIn(true);
    setLoginMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.text();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data || "Login failed");
      }

      localStorage.setItem("docspotToken", data);

      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${data}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error("Unable to fetch user profile");
      }

      const profileData = await profileResponse.json();

      console.log("Logged-in user profile:", profileData);

      setUserRole(profileData.role);
      setProfile(profileData);
      if (profileData.role === "DOCTOR") {
        const doctorResponse = await fetch(
          `${API_BASE_URL}/doctors/user/${profileData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${data}`,
            },
          },
        );

        if (!doctorResponse.ok) {
          throw new Error("Unable to fetch doctor profile");
        }

        const doctorData = await doctorResponse.json();

        console.log("Logged-in doctor:", doctorData);

        setDoctorId(doctorData.id);
      }
      setIsLoggedIn(true);

      setLoginMessage("Login successful!");
      setShowLogin(false);
    } catch (error) {
      setLoginMessage(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };
  const handleRegister = async (event) => {
    event.preventDefault();

    if (registerPassword !== confirmPassword) {
      setRegisterMessage("Passwords do not match.");
      return;
    }

    if (
      !registerName.trim() ||
      !registerEmail.trim() ||
      !registerPassword.trim()
    ) {
      setRegisterMessage("Please fill all fields.");
      return;
    }

    if (
      registerRole === "DOCTOR" &&
      (!specialization.trim() ||
        !qualification.trim() ||
        !experience ||
        !consultationFee ||
        !clinicName.trim() ||
        !clinicAddress.trim() ||
        !aboutDoctor.trim())
    ) {
      setRegisterMessage("Please fill all doctor fields.");
      return;
    }

    setIsRegistering(true);
    setRegisterMessage("");

    try {
      const endpoint =
        registerRole === "DOCTOR"
          ? `${API_BASE_URL}/auth/register-doctor`
          : `${API_BASE_URL}/auth/register`;

      const requestBody =
        registerRole === "DOCTOR"
          ? {
              name: registerName,
              email: registerEmail,
              password: registerPassword,
              specialization: specialization,
              qualification: qualification,
              experience: Number(experience),
              consultationFee: Number(consultationFee),
              clinicName: clinicName,
              clinicAddress: clinicAddress,
              about: aboutDoctor,
            }
          : {
              name: registerName,
              email: registerEmail,
              password: registerPassword,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.text();

      console.log("Registration status:", response.status);
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data || "Registration failed. Please try again.");
      }

      setRegisterMessage(
        registerRole === "DOCTOR"
          ? "Doctor registration successful! You can now login."
          : "Registration successful! You can now login.",
      );

      // Clear common fields
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setConfirmPassword("");

      // Clear doctor fields
      setSpecialization("");
      setQualification("");
      setExperience("");
      setConsultationFee("");
      setClinicName("");
      setClinicAddress("");
      setAboutDoctor("");
    } catch (error) {
      console.error("Registration error:", error);
      setRegisterMessage(error.message);
    } finally {
      setIsRegistering(false);
    }
  };
  // 👇 ADD handleFindDoctors HERE
  const handleFindDoctors = async () => {
    setIsLoadingDoctors(true);
    setDoctorError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch doctors");
      }

      const data = await response.json();

      setDoctors(data);
      setShowDoctors(true);
    } catch (error) {
      setDoctorError(error.message);
    } finally {
      setIsLoadingDoctors(false);
    }
  };
  const isTimeBooked = (doctorId, date, time) => {
    return appointments.some((appointment) => {
      if (
        appointment.doctorId !== doctorId ||
        appointment.appointmentDate !== date
      ) {
        return false;
      }

      const bookedTime = appointment.appointmentTime?.substring(0, 5);

      return bookedTime === time && appointment.status !== "CANCELLED";
    });
  };
  const loadPatientAppointments = async () => {
    if (!profile) {
      return [];
    }

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/appointments/patient/${profile.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to fetch patient appointments");
      }

      const data = await response.json();

      console.log("Latest patient appointments:", data);

      setAppointments(data);

      return data;
    } catch (error) {
      console.error("Appointment loading error:", error);
      return [];
    }
  };
  const handleViewNotifications = async () => {
    try {
      const token = localStorage.getItem("docspotToken");

      if (!profile?.id) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${profile.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch notifications");
      }

      setNotifications(data);
      setShowNotifications(true);
    } catch (error) {
      console.error("Notification error:", error);
      alert(error.message);
    }
  };
  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to mark notification as read");
      }

      // Update notification immediately in the UI
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Mark as read error:", error);
      alert(error.message);
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("docspotToken");

      if (!profile?.id) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${profile.id}/read-all`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Unable to mark all notifications as read");
      }

      // Update all notifications in the UI
      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      );
    } catch (error) {
      console.error("Mark all as read error:", error);
      alert(error.message);
    }
  };

  const handleViewAvailability = async (doctorId) => {
    setIsLoadingAvailability(false);
    setAvailability([]);
    setAvailabilityError("");
    setSelectedDate("");
    setSelectedSlot(null);
    setShowBookingForm(false);
  };

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setAvailabilityError("");
    setAvailability([]);

    if (!date || !selectedDoctor) {
      return;
    }

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/weekly-schedule/doctor/${selectedDoctor.id}/date?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 404) {
        setAvailability([]);
        setAvailabilityError("No available slots for selected date");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch schedule for selected date");
      }

      const schedule = await response.json();

      console.log("Selected date weekly schedule:", schedule);
      // Get already booked appointment times for this doctor and date
      const bookedResponse = await fetch(
        `${API_BASE_URL}/appointments/doctor/${selectedDoctor.id}/booked-slots?date=${date}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!bookedResponse.ok) {
        throw new Error("Unable to fetch booked appointment slots");
      }

      const bookedTimes = await bookedResponse.json();

      console.log("Booked times:", bookedTimes);

      // Generate 30-minute appointment slots
      const slots = [];

      let currentMinutes =
        Number(schedule.startTime.substring(0, 2)) * 60 +
        Number(schedule.startTime.substring(3, 5));

      const endMinutes =
        Number(schedule.endTime.substring(0, 2)) * 60 +
        Number(schedule.endTime.substring(3, 5));

      while (currentMinutes < endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const minutes = currentMinutes % 60;

        const nextMinutes = currentMinutes + 30;

        const nextHours = Math.floor(nextMinutes / 60);
        const nextMinuteValue = nextMinutes % 60;

        const slotStartTime =
          `${String(hours).padStart(2, "0")}:` +
          `${String(minutes).padStart(2, "0")}:00`;

        const slotEndTime =
          `${String(nextHours).padStart(2, "0")}:` +
          `${String(nextMinuteValue).padStart(2, "0")}:00`;

        const isBooked = bookedTimes.some(
          (bookedTime) =>
            bookedTime.substring(0, 5) === slotStartTime.substring(0, 5),
        );

        slots.push({
          id: `${selectedDoctor.id}-${date}-${currentMinutes}`,
          doctorId: selectedDoctor.id,
          availableDate: date,
          startTime: slotStartTime,
          endTime: slotEndTime,
          booked: isBooked,
        });

        currentMinutes = nextMinutes;
      }

      setAvailability(slots);

      await loadPatientAppointments();
    } catch (error) {
      console.error("Date availability error:", error);
      setAvailabilityError(error.message);
    }
  };
  const handleConfirmBooking = async () => {
    console.log("PROFILE:", profile);
    console.log("SELECTED DOCTOR:", selectedDoctor);
    console.log("SELECTED SLOT:", selectedSlot);

    if (!profile) {
      alert("Patient profile not loaded. Please login again.");
      return;
    }

    if (!selectedDoctor) {
      alert("Doctor not selected.");
      return;
    }

    if (!selectedSlot) {
      alert("Appointment slot not selected.");
      return;
    }

    if (!appointmentReason.trim()) {
      alert("Please enter the reason for the appointment.");
      return;
    }

    try {
      const token = localStorage.getItem("docspotToken");

      console.log("TOKEN EXISTS:", !!token);
      console.log("TOKEN LENGTH:", token ? token.length : 0);

      if (!token) {
        alert("Login session expired. Please login again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/appointments?patientId=${profile.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            doctorId: selectedDoctor.id,
            appointmentDate: selectedSlot.availableDate,
            appointmentTime: selectedSlot.startTime,
            reason: appointmentReason,
          }),
        },
      );

      const data = await response.text();

      console.log("Booking API status:", response.status);
      console.log("Booking API response:", data);

      if (!response.ok) {
        throw new Error(
          data || `Booking failed with status ${response.status}`,
        );
      }

      alert("Appointment booked successfully!");

      setShowBookingForm(false);
      setSelectedSlot(null);
      setAppointmentReason("");
    } catch (error) {
      console.error("FULL BOOKING ERROR:", error);
      alert(error.message);
    }
  };
  const handleViewAppointments = async () => {
    setIsLoadingAppointments(true);
    setAppointmentsError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/appointments/patient/${profile.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to fetch appointments");
      }

      const data = await response.json();

      console.log("Appointments API response:", data);

      setAppointments(data);
      setShowAppointments(true);
    } catch (error) {
      setAppointmentsError(error.message);
    } finally {
      setIsLoadingAppointments(false);
    }
  };
  const handleCancelAppointment = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );

    if (!confirmCancel) {
      return;
    }

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || "Unable to cancel appointment");
      }

      alert("Appointment cancelled successfully!");

      // Refresh appointments
      handleViewAppointments();
    } catch (error) {
      alert(error.message);
    }
  };
  const handleViewProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to fetch profile");
      }

      const data = await response.json();

      console.log("Patient Profile API response:", data);

      setProfile(data);
      setShowProfile(true);
    } catch (error) {
      console.error("Profile error:", error);
      setProfileError(error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };
  const handleViewDoctorProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError("");

    try {
      const token = localStorage.getItem("docspotToken");

      if (!profile?.id) {
        throw new Error("Doctor profile not loaded");
      }

      const response = await fetch(
        `${API_BASE_URL}/doctors/user/${profile.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to fetch doctor profile");
      }

      const data = await response.json();

      console.log("Doctor Profile API response:", data);

      setDoctorProfile(data);
    } catch (error) {
      console.error("Doctor profile error:", error);
      setProfileError(error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  if (isLoggedIn) {
    if (userRole === "DOCTOR") {
      return (
        <div className="dashboard">
          <header className="dashboard-header">
            <h1>DocSpot - Doctor Dashboard 🩺</h1>

            <div className="header-actions">
              <button
                className="notification-btn"
                onClick={handleViewNotifications}
              >
                🔔 Notifications
                {notifications.filter((notification) => !notification.read)
                  .length > 0 && (
                  <span className="notification-count">
                    {
                      notifications.filter((notification) => !notification.read)
                        .length
                    }
                  </span>
                )}
              </button>

              <button
                className="logout-btn"
                onClick={() => {
                  localStorage.removeItem("docspotToken");
                  window.location.reload();
                }}
              >
                🚪 Logout
              </button>
            </div>
          </header>
          {showNotifications && (
            <div className="notifications-panel">
              <div className="notifications-header">
                <h2>🔔 Notifications</h2>

                <div className="notification-header-actions">
                  <button
                    className="mark-all-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    ✓ Mark All as Read
                  </button>

                  <button
                    className="close-notifications-btn"
                    onClick={() => setShowNotifications(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications yet.</p>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="notification-message">
                        {notification.message}
                      </div>

                      <div className="notification-meta">
                        {notification.type} •{" "}
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <main className="dashboard-content">
            <h2>Welcome, Doctor 👋</h2>
            <p>Manage your appointments and patients from here.</p>

            <div className="dashboard-cards">
              <div className="dashboard-card">
                <h3>📅 My Appointments</h3>
                <p>View and manage your patient appointments.</p>

                <button
                  className="primary-btn"
                  onClick={handleViewDoctorAppointments}
                >
                  View Appointments
                </button>
              </div>

              <div className="dashboard-card">
                <h3>👤 My Profile</h3>
                <p>View your doctor account information.</p>
                <button
                  className="primary-btn"
                  onClick={handleViewDoctorProfile}
                >
                  View Profile
                </button>
              </div>
              <div className="dashboard-card">
                <h3>🗓️ My Availability</h3>
                <p>
                  Set the days and times when patients can book appointments.
                </p>
                <button
                  className="primary-btn"
                  onClick={() => {
                    setShowAvailabilityManager(true);
                    setAvailabilityMessage("");
                  }}
                >
                  Manage Availability
                </button>
              </div>
            </div>

            {showAvailabilityManager && (
              <div className="availability-manager">
                <h2>🗓️ My Weekly Availability</h2>

                <p>
                  Select the days and time when patients can book appointments.
                </p>

                <h3>Select Available Days</h3>

                <div className="availability-days">
                  {[
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                  ].map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        value={day}
                        checked={availableDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailableDays([...availableDays, day]);
                          } else {
                            setAvailableDays(
                              availableDays.filter(
                                (selectedDay) => selectedDay !== day,
                              ),
                            );
                          }
                        }}
                      />

                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>

                <h3>Set Working Hours</h3>

                <div className="availability-time">
                  <div>
                    <label>Start Time</label>

                    <input
                      type="time"
                      value={availabilityStartTime}
                      onChange={(e) => setAvailabilityStartTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>End Time</label>

                    <input
                      type="time"
                      value={availabilityEndTime}
                      onChange={(e) => setAvailabilityEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {availabilityMessage && (
                  <p className="availability-message">{availabilityMessage}</p>
                )}

                <button
                  className="primary-btn"
                  onClick={handleSaveAvailability}
                  disabled={isSavingAvailability}
                >
                  {isSavingAvailability ? "Saving..." : "Save Availability"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setShowAvailabilityManager(false)}
                >
                  Close
                </button>
              </div>
            )}

            {showDoctorAppointments && (
              <div className="appointments-section">
                <h2>📅 My Appointments</h2>

                {isLoadingDoctorAppointments && <p>Loading appointments...</p>}

                {doctorAppointmentsError && (
                  <p className="error-message">{doctorAppointmentsError}</p>
                )}

                {!isLoadingDoctorAppointments &&
                  !doctorAppointmentsError &&
                  doctorAppointments.length === 0 && (
                    <p>No appointments found.</p>
                  )}

                {!isLoadingDoctorAppointments &&
                  !doctorAppointmentsError &&
                  doctorAppointments.map((appointment) => (
                    <div className="appointment-card" key={appointment.id}>
                      <h3>👤 {appointment.patientName}</h3>

                      <p>
                        <strong>Date:</strong> {appointment.appointmentDate}
                      </p>

                      <p>
                        <strong>Time:</strong> {appointment.appointmentTime}
                      </p>

                      <p>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>

                      <p>
                        <strong>Status:</strong> {appointment.status}
                      </p>
                      {appointment.status === "PENDING" && (
                        <div className="appointment-actions">
                          <button
                            className="primary-btn"
                            onClick={() =>
                              handleUpdateAppointmentStatus(
                                appointment.id,
                                "CONFIRMED",
                              )
                            }
                          >
                            ✅ Confirm
                          </button>

                          <button
                            className="cancel-btn"
                            onClick={() =>
                              handleUpdateAppointmentStatus(
                                appointment.id,
                                "CANCELLED",
                              )
                            }
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      )}

                      {appointment.status === "CONFIRMED" && (
                        <button
                          className="primary-btn"
                          onClick={() =>
                            handleUpdateAppointmentStatus(
                              appointment.id,
                              "COMPLETED",
                            )
                          }
                        >
                          ✔️ Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}

                <button
                  className="secondary-btn"
                  onClick={() => setShowDoctorAppointments(false)}
                >
                  Close Appointments
                </button>
              </div>
            )}
            {doctorProfile && (
              <div className="profile-section">
                <h2>👨‍⚕️ My Doctor Profile</h2>

                {isLoadingProfile && <p>Loading profile...</p>}

                {profileError && (
                  <p className="error-message">{profileError}</p>
                )}

                {!isLoadingProfile && !profileError && (
                  <div className="profile-card">
                    <h3>👨‍⚕️ {doctorProfile.user?.name || profile?.name}</h3>

                    <p>
                      <strong>Email:</strong>{" "}
                      {doctorProfile.user?.email || profile?.email}
                    </p>

                    <p>
                      <strong>Doctor ID:</strong> {doctorProfile.id}
                    </p>

                    <p>
                      <strong>Specialization:</strong>{" "}
                      {doctorProfile.specialization}
                    </p>

                    <p>
                      <strong>Qualification:</strong>{" "}
                      {doctorProfile.qualification}
                    </p>

                    <p>
                      <strong>Experience:</strong> {doctorProfile.experience}{" "}
                      years
                    </p>

                    <p>
                      <strong>Consultation Fee:</strong> ₹
                      {doctorProfile.consultationFee}
                    </p>

                    <p>
                      <strong>Clinic:</strong> {doctorProfile.clinicName}
                    </p>

                    <p>
                      <strong>Clinic Address:</strong>{" "}
                      {doctorProfile.clinicAddress}
                    </p>

                    <p>
                      <strong>About:</strong> {doctorProfile.about}
                    </p>

                    <button
                      className="secondary-btn"
                      onClick={() => setDoctorProfile(null)}
                    >
                      Close Profile
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      );
    }
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <h1>DocSpot</h1>

          <div className="header-actions">
            <button
              className="notification-btn"
              onClick={handleViewNotifications}
            >
              🔔 Notifications
              {notifications.filter((notification) => !notification.read)
                .length > 0 && (
                <span className="notification-count">
                  {
                    notifications.filter((notification) => !notification.read)
                      .length
                  }
                </span>
              )}
            </button>

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.removeItem("docspotToken");
                window.location.reload();
              }}
            >
              🚪 Logout
            </button>
          </div>
        </header>
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h2>🔔 Notifications</h2>

              <div className="notification-header-actions">
                <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                  ✓ Mark All as Read
                </button>

                <button
                  className="close-notifications-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="no-notifications">No notifications yet.</p>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.read ? "read" : "unread"
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="notification-message">
                      {notification.message}
                    </div>

                    <div className="notification-meta">
                      {notification.type} •{" "}
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <main className="dashboard-content">
          <h2>Welcome to DocSpot 👋</h2>
          <p>Book and manage your doctor appointments easily.</p>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>🔍 Find a Doctor</h3>
              <p>Search doctors by specialization and view their details.</p>

              <button
                className="primary-btn"
                onClick={handleFindDoctors}
                disabled={isLoadingDoctors}
              >
                {isLoadingDoctors ? "Loading..." : "Find Doctors"}
              </button>
            </div>

            <div className="dashboard-card">
              <h3>📅 My Appointments</h3>
              <p>View and manage your upcoming appointments.</p>
              <button className="primary-btn" onClick={handleViewAppointments}>
                My Appointments
              </button>
            </div>
            {/* {showAvailabilityManager && (
              <div className="availability-manager">
                <h2>🗓️ My Weekly Availability</h2>
                <p>
                  Select the days and time when patients can book appointments.
                </p>

                <h3>Select Available Days</h3>

                <div className="availability-days">
                  {[
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                  ].map((day) => (
                    <label key={day}>
                      <input
                        type="checkbox"
                        value={day}
                        checked={availableDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAvailableDays([...availableDays, day]);
                          } else {
                            setAvailableDays(
                              availableDays.filter(
                                (selectedDay) => selectedDay !== day,
                              ),
                            );
                          }
                        }}
                      />

                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>

                <h3>Set Working Hours</h3>

                <div className="availability-time">
                  <div>
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={availabilityStartTime}
                      onChange={(e) => setAvailabilityStartTime(e.target.value)}
                    />
                  </div>

                  <div>
                    <label>End Time</label>
                    <input
                      type="time"
                      value={availabilityEndTime}
                      onChange={(e) => setAvailabilityEndTime(e.target.value)}
                    />
                  </div>
                </div>

                {availabilityMessage && (
                  <p className="availability-message">{availabilityMessage}</p>
                )}

                <button
                  className="primary-btn"
                  onClick={handleSaveAvailability}
                  disabled={isSavingAvailability}
                >
                  {isSavingAvailability ? "Saving..." : "Save Availability"}
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => setShowAvailabilityManager(false)}
                >
                  Close
                </button>
              </div>
            )} */}

            {showAppointments && (
              <div className="appointments-section">
                <h2>My Appointments</h2>

                {isLoadingAppointments && <p>Loading appointments...</p>}

                {appointmentsError && (
                  <p className="error-message">{appointmentsError}</p>
                )}

                {!isLoadingAppointments &&
                  !appointmentsError &&
                  appointments.length === 0 && <p>No appointments found.</p>}

                {!isLoadingAppointments &&
                  appointments.map((appointment) => (
                    <div className="appointment-card" key={appointment.id}>
                      <h3>{appointment.doctorName}</h3>

                      <p>
                        <strong>Date:</strong> {appointment.appointmentDate}
                      </p>

                      <p>
                        <strong>Time:</strong> {appointment.appointmentTime}
                      </p>

                      <p>
                        <strong>Reason:</strong> {appointment.reason}
                      </p>

                      <p>
                        <strong>Status:</strong> {appointment.status}
                      </p>
                      {appointment.status === "PENDING" && (
                        <button
                          className="cancel-btn"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  ))}
                <button
                  className="secondary-btn"
                  onClick={() => setShowAppointments(false)}
                >
                  Close Appointments
                </button>
              </div>
            )}

            <div className="dashboard-card">
              <h3>👤 My Profile</h3>
              <p>View your DocSpot account information.</p>
              <button className="primary-btn" onClick={handleViewProfile}>
                View Profile
              </button>
            </div>
          </div>
          {showProfile && (
            <div className="profile-section">
              <h2>My Profile</h2>

              {isLoadingProfile && <p>Loading profile...</p>}

              {profileError && <p className="error-message">{profileError}</p>}

              {!isLoadingProfile && !profileError && profile && (
                <div className="profile-card">
                  <h3>👤 {profile.name}</h3>

                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>

                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>

                  <p>
                    <strong>User ID:</strong> {profile.id}
                  </p>

                  <p>
                    <strong>Account Created:</strong>{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>

                  <button
                    className="secondary-btn"
                    onClick={() => setShowProfile(false)}
                  >
                    Close Profile
                  </button>
                </div>
              )}
            </div>
          )}
          {showDoctors && (
            <div className="doctors-section">
              <h2>Available Doctors</h2>

              {doctorError && <p className="doctor-error">{doctorError}</p>}

              {doctors.length === 0 && !doctorError ? (
                <p>No doctors found.</p>
              ) : (
                <div className="doctor-list">
                  {doctors.map((doctor) => (
                    <div className="doctor-card" key={doctor.id}>
                      <h3>{doctor.doctorName}</h3>

                      <p>
                        <strong>Specialization:</strong> {doctor.specialization}
                      </p>

                      <p>
                        <strong>Qualification:</strong> {doctor.qualification}
                      </p>

                      <p>
                        <strong>Experience:</strong> {doctor.experience} years
                      </p>

                      <p>
                        <strong>Consultation Fee:</strong> ₹
                        {doctor.consultationFee}
                      </p>

                      <p>
                        <strong>Clinic:</strong> {doctor.clinicName}
                      </p>

                      <button
                        className="primary-btn"
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          handleViewAvailability(doctor.id);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedDoctor && (
            <div className="doctor-details">
              <h2>Doctor Details</h2>

              <h3>{selectedDoctor.doctorName}</h3>

              <p>
                <strong>Specialization:</strong> {selectedDoctor.specialization}
              </p>

              <p>
                <strong>Qualification:</strong> {selectedDoctor.qualification}
              </p>

              <p>
                <strong>Experience:</strong> {selectedDoctor.experience} years
              </p>

              <p>
                <strong>Consultation Fee:</strong> ₹
                {selectedDoctor.consultationFee}
              </p>

              <p>
                <strong>Clinic:</strong> {selectedDoctor.clinicName}
              </p>

              <p>
                <strong>Address:</strong> {selectedDoctor.clinicAddress}
              </p>

              <p>
                <strong>About:</strong> {selectedDoctor.about}
              </p>
              <h3>Available Dates & Times</h3>

              {isLoadingAvailability && <p>Loading availability...</p>}

              {availabilityError && <p>{availabilityError}</p>}

              {!isLoadingAvailability &&
                !availabilityError &&
                availability.length === 0 && (
                  <p>No availability found for this doctor.</p>
                )}

              <div className="calendar-section">
                <h3>📅 Select Appointment Date</h3>

                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(event) => handleDateChange(event.target.value)}
                />
              </div>
              {selectedDate && (
                <div className="selected-date-section">
                  <h3>Available Slots for {selectedDate}</h3>

                  {isLoadingAvailability ? (
                    <p>Loading available slots...</p>
                  ) : availabilityError ? (
                    <p className="error-message">{availabilityError}</p>
                  ) : availability.length === 0 ? (
                    <p>No available slots for the selected date.</p>
                  ) : (
                    <div className="time-slot-container">
                      {availability.map((slot) => {
                        const booked = slot.booked;

                        return (
                          <button
                            key={slot.id}
                            className={
                              booked ? "booked-slot-btn" : "primary-btn"
                            }
                            disabled={booked}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setShowBookingForm(true);
                            }}
                          >
                            {slot.startTime.substring(0, 5)} -{" "}
                            {slot.endTime.substring(0, 5)}
                            {booked ? " 🔴 BOOKED" : " 🟢 AVAILABLE"}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {selectedDate && availability.length === 0 && (
                <p className="no-availability">
                  No available slots for the selected date. Please choose
                  another date.
                </p>
              )}

              {showBookingForm && selectedSlot && (
                <div className="booking-form">
                  <h3>Book Appointment</h3>

                  <p>
                    <strong>Doctor:</strong> {selectedDoctor.doctorName}
                  </p>

                  <p>
                    <strong>Date:</strong> {selectedSlot.availableDate}
                  </p>

                  <p>
                    <strong>Available Time:</strong> {selectedSlot.startTime} -{" "}
                    {selectedSlot.endTime}
                  </p>

                  <label>
                    <strong>Reason for Appointment:</strong>
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Regular checkup"
                    value={appointmentReason}
                    onChange={(event) =>
                      setAppointmentReason(event.target.value)
                    }
                  />

                  <button
                    className="primary-btn"
                    onClick={handleConfirmBooking}
                  >
                    Confirm Booking
                  </button>

                  <button
                    className="secondary-btn"
                    onClick={() => {
                      setShowBookingForm(false);
                      setSelectedSlot(null);
                      setAppointmentReason("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <button
                className="primary-btn"
                onClick={() => setSelectedDoctor(null)}
              >
                Close
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🩺 DocSpot</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#doctors">Doctors</a>
          <a href="#about">About</a>

          <button className="login-btn" onClick={() => setShowLogin(true)}>
            Login
          </button>
          <button
            className="register-btn"
            onClick={() => {
              setShowRegister(true);
              setRegisterMessage("");
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="small-title">YOUR HEALTH, OUR PRIORITY</p>

          <h1>
            Find the right doctor
            <br />
            <span>for your healthcare needs.</span>
          </h1>

          <p className="hero-text">
            Book appointments with trusted doctors quickly and easily. Get
            quality healthcare at your convenience.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Find a Doctor</button>

            <button className="secondary-btn">Book Appointment</button>
          </div>
        </div>

        <div className="hero-card">
          <div className="doctor-icon">👨‍⚕️</div>

          <h3>Professional Healthcare</h3>

          <p>
            Connect with qualified doctors and manage your appointments easily.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="about">
        <h2>Why Choose DocSpot?</h2>

        <p className="section-subtitle">
          Simple and convenient healthcare appointment management.
        </p>

        <div className="feature-container">
          <div className="feature-card">
            <div className="feature-icon">🔎</div>
            <h3>Find Doctors</h3>
            <p>
              Search doctors based on specialization and healthcare
              requirements.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>Select a convenient date and time and book your appointment.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Access</h3>
            <p>
              Secure authentication keeps your account and appointment
              information protected.
            </p>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="doctors-section" id="doctors">
        <h2>Our Doctors</h2>

        <p className="section-subtitle">
          Find healthcare professionals for your needs.
        </p>

        <div className="doctor-container">
          <div className="doctor-card">
            <div className="doctor-avatar">👨‍⚕️</div>

            <h3>Dr. Rahul</h3>

            <p className="specialization">Cardiologist</p>

            <p>MBBS, MD</p>

            <button className="book-btn">View Profile</button>
          </div>

          <div className="doctor-card">
            <div className="doctor-avatar">👩‍⚕️</div>

            <h3>Dr. Priya</h3>

            <p className="specialization">Dermatologist</p>

            <p>MBBS, MD</p>

            <button className="book-btn">View Profile</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <h3>🩺 DocSpot</h3>

        <p>Seamless Appointment Booking for Health</p>

        <p className="copyright">© 2026 DocSpot. All rights reserved.</p>
      </footer>

      {/* Login Modal */}
      {showLogin && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button className="close-btn" onClick={() => setShowLogin(false)}>
              ×
            </button>

            <h2>Welcome Back</h2>

            <p>Login to your DocSpot account</p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />

              <button
                type="submit"
                className="primary-btn login-submit"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>

            {loginMessage && <p className="login-message">{loginMessage}</p>}

            <p className="modal-register">
              Don't have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                  setRegisterMessage("");
                }}
              >
                Register
              </span>
            </p>
          </div>
        </div>
      )}
      {showRegister && (
        <div className="modal-overlay">
          <div className="login-modal">
            <button
              className="close-btn"
              onClick={() => {
                setShowRegister(false);
                setRegisterMessage("");
              }}
            >
              ×
            </button>

            <h2>Create Account</h2>

            <p>Create your DocSpot account</p>

            <div className="register-role-section">
              <p>Register as:</p>

              <label>
                <input
                  type="radio"
                  name="registerRole"
                  value="PATIENT"
                  checked={registerRole === "PATIENT"}
                  onChange={(event) => setRegisterRole(event.target.value)}
                />
                Patient
              </label>

              <label>
                <input
                  type="radio"
                  name="registerRole"
                  value="DOCTOR"
                  checked={registerRole === "DOCTOR"}
                  onChange={(event) => setRegisterRole(event.target.value)}
                />
                Doctor
              </label>
            </div>

            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={registerName}
                onChange={(event) => setRegisterName(event.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(event) => setRegisterEmail(event.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(event) => setRegisterPassword(event.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />

              {registerRole === "DOCTOR" && (
                <>
                  <h3>Doctor Information</h3>

                  <input
                    type="text"
                    placeholder="Specialization"
                    value={specialization}
                    onChange={(event) => setSpecialization(event.target.value)}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Qualification"
                    value={qualification}
                    onChange={(event) => setQualification(event.target.value)}
                    required
                  />

                  <input
                    type="number"
                    placeholder="Years of Experience"
                    value={experience}
                    onChange={(event) => setExperience(event.target.value)}
                    min="0"
                    required
                  />

                  <input
                    type="number"
                    placeholder="Consultation Fee"
                    value={consultationFee}
                    onChange={(event) => setConsultationFee(event.target.value)}
                    min="0"
                    required
                  />

                  <input
                    type="text"
                    placeholder="Clinic Name"
                    value={clinicName}
                    onChange={(event) => setClinicName(event.target.value)}
                    required
                  />

                  <input
                    type="text"
                    placeholder="Clinic Address"
                    value={clinicAddress}
                    onChange={(event) => setClinicAddress(event.target.value)}
                    required
                  />

                  <textarea
                    placeholder="About Doctor"
                    value={aboutDoctor}
                    onChange={(event) => setAboutDoctor(event.target.value)}
                    required
                  />
                </>
              )}

              <button
                type="submit"
                className="primary-btn login-submit"
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </button>
            </form>

            {registerMessage && (
              <p className="login-message">{registerMessage}</p>
            )}

            <p className="modal-register">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                  setRegisterMessage("");
                }}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
