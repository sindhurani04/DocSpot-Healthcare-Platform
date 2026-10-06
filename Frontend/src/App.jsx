import { useState, useEffect } from "react";
import API_BASE_URL from "./services/api";
import "./App.css";

const formatDoctorName = (name) => {
  if (!name) return "";

  const trimmedName = name.trim();

  if (/^Dr\.\s/i.test(trimmedName)) {
    return trimmedName;
  }

  return `Dr. ${trimmedName}`;
};

const formatNotificationMessage = (notification) => {
  if (!notification?.message) {
    return "";
  }

  const message = notification.message.trim();

  if (
    notification.type === "CONFIRMATION" ||
    notification.type === "CANCELLATION" ||
    notification.type === "COMPLETION"
  ) {
    if (/^Dr\.\s/i.test(message)) {
      return message;
    }

    return `Dr. ${message}`;
  }

  return message;
};

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
  const [selectedSpecialization, setSelectedSpecialization] = useState("");

  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [doctorError, setDoctorError] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [doctorHasAvailability, setDoctorHasAvailability] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState("");

  const [appointmentsSuccess, setAppointmentsSuccess] = useState("");
  const [cancellationSuccess, setCancellationSuccess] = useState("");
  const [cancelAppointmentId, setCancelAppointmentId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentReason, setAppointmentReason] = useState("");
  const [showProfile, setShowProfile] = useState(false);

  const [patientSection, setPatientSection] = useState("dashboard");

  const [profile, setProfile] = useState(null);

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [doctorId, setDoctorId] = useState(null);
  // Admin Dashboard
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPatients, setAdminPatients] = useState([]);
  const [adminDoctors, setAdminDoctors] = useState([]);
  const [adminAppointments, setAdminAppointments] = useState([]);

  const [adminSection, setAdminSection] = useState("");
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  const [pendingDoctors, setPendingDoctors] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  // Doctor Dashboard
  const [doctorSection, setDoctorSection] = useState("dashboard");
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  const [showDoctorAppointments, setShowDoctorAppointments] = useState(false);
  const [isLoadingDoctorAppointments, setIsLoadingDoctorAppointments] =
    useState(false);

  const [doctorAppointmentsError, setDoctorAppointmentsError] = useState("");
  const [doctorAppointmentsSuccess, setDoctorAppointmentsSuccess] =
    useState("");

  // Doctor Availability
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [availableDays, setAvailableDays] = useState([]);
  const [availabilityStartTime, setAvailabilityStartTime] = useState("09:00");
  const [availabilityEndTime, setAvailabilityEndTime] = useState("20:00");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityCompleted, setAvailabilityCompleted] = useState(false);

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

          setDoctorId(doctorData.id);
        }
      } catch (error) {
        console.error("Profile loading error:", error);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadDoctorAvailabilityStatus = async () => {
      if (userRole !== "DOCTOR" || !doctorId) {
        return;
      }

      const token = localStorage.getItem("docspotToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/weekly-schedule/doctor/${doctorId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load availability");
        }

        const schedules = await response.json();

        console.log("Doctor weekly schedules:", schedules);

        const completed = schedules.some(
          (schedule) =>
            schedule.available === true &&
            schedule.startTime &&
            schedule.endTime,
        );

        setAvailabilityCompleted(completed);
      } catch (error) {
        console.error("Availability status loading error:", error);
        setAvailabilityCompleted(false);
      }
    };

    loadDoctorAvailabilityStatus();
  }, [userRole, doctorId]);

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
      setAvailabilityCompleted(true);
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

      if (status === "CONFIRMED") {
        setDoctorAppointmentsSuccess("Appointment confirmed successfully!");
      } else if (status === "COMPLETED") {
        setDoctorAppointmentsSuccess("Appointment completed successfully!");
      } else if (status === "CANCELLED") {
        setDoctorAppointmentsSuccess("Appointment cancelled successfully!");
      }

      await handleViewDoctorAppointments();
    } catch (error) {
      console.error("Status update error:", error);
      setDoctorAppointmentsError(error.message);
    }
  };

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

      // Clear landing-page URL hash when entering dashboard
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );

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

  const loadDoctorsForSpecializations = async () => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to load doctors");
      }

      const data = await response.json();

      setDoctors(data);
    } catch (error) {
      console.error("Specialization loading error:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userRole === "PATIENT") {
      loadDoctorsForSpecializations();
    }
  }, [isLoggedIn, userRole]);

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
    if (userRole === "DOCTOR") {
      setDoctorSection("notifications");
      setShowDoctorAppointments(false);
      setShowAvailabilityManager(false);
      setDoctorProfile(null);
    } else {
      setPatientSection("notifications");
      setShowAppointments(false);
      setShowDoctors(false);
      setShowProfile(false);
      setSelectedDoctor(null);
    }
    setShowNotifications(true);

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
      setPatientSection("notifications");
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
    setIsLoadingAvailability(true);
    setAvailability([]);
    setAvailabilityError("");
    setSelectedDate("");
    setSelectedSlot(null);
    setShowBookingForm(false);
    setDoctorHasAvailability(false);

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/weekly-schedule/doctor/${doctorId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Unable to load doctor availability");
      }

      const schedules = await response.json();

      const hasAvailability = schedules.some(
        (schedule) =>
          schedule.available === true && schedule.startTime && schedule.endTime,
      );

      setDoctorHasAvailability(hasAvailability);
    } catch (error) {
      console.error("Doctor availability loading error:", error);
      setDoctorHasAvailability(false);
    } finally {
      setIsLoadingAvailability(false);
    }
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
        setAvailabilityError("");
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

      const today = new Date().toISOString().split("T")[0];

      const currentTimeInMinutes =
        new Date().getHours() * 60 + new Date().getMinutes();

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
          past: date === today && currentMinutes <= currentTimeInMinutes,
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
    setAppointmentsSuccess("");
    setAppointmentsError("");
    console.log("PROFILE:", profile);
    console.log("SELECTED DOCTOR:", selectedDoctor);
    console.log("SELECTED SLOT:", selectedSlot);

    if (!profile) {
      setAppointmentsError("Patient profile not loaded. Please login again.");
      return;
    }

    if (!selectedDoctor) {
      setAppointmentsError("Doctor not selected.");
      return;
    }

    if (!selectedSlot) {
      setAppointmentsError("Appointment slot not selected.");
      return;
    }

    if (!appointmentReason.trim()) {
      setAppointmentsError("Please enter the reason for the appointment.");
      return;
    }

    try {
      const token = localStorage.getItem("docspotToken");

      console.log("TOKEN EXISTS:", !!token);
      console.log("TOKEN LENGTH:", token ? token.length : 0);

      if (!token) {
        setAppointmentsError("Login session expired. Please login again.");
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

      setAppointmentsSuccess("Appointment booked successfully!");

      setShowBookingForm(false);
      setSelectedSlot(null);
      setAppointmentReason("");
    } catch (error) {
      console.error("FULL BOOKING ERROR:", error);
      setAppointmentsError(error.message);
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
  const handleCancelAppointment = async (appointmentId, confirmed = false) => {
    if (!confirmed) {
      setCancelAppointmentId(appointmentId);
      return;
    }

    setAppointmentsSuccess("");
    setAppointmentsError("");

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
      setCancelAppointmentId(null);
      setCancellationSuccess("Appointment cancelled successfully!");

      // Refresh appointments
      handleViewAppointments();
    } catch (error) {
      setAppointmentsError(error.message);
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

  // ================= ADMIN API FUNCTIONS =================

  const handleLoadAdminDashboard = async () => {
    setIsLoadingAdmin(true);
    setAdminError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load admin dashboard");
      }

      const data = await response.json();
      setAdminStats(data);
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleLoadAdminUsers = async () => {
    setIsLoadingAdmin(true);
    setAdminError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load users");
      }

      const data = await response.json();
      setAdminUsers(data);
    } catch (error) {
      console.error("Admin users error:", error);
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleLoadAdminPatients = async () => {
    setIsLoadingAdmin(true);
    setAdminError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/patients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load patients");
      }

      const data = await response.json();
      setAdminPatients(data);
    } catch (error) {
      console.error("Admin patients error:", error);
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleLoadAdminDoctors = async () => {
    setIsLoadingAdmin(true);
    setAdminError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load doctors");
      }

      const data = await response.json();
      setAdminDoctors(data);
    } catch (error) {
      console.error("Admin doctors error:", error);
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleLoadPendingDoctors = async () => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/pending-doctors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load pending doctors");
      }

      const data = await response.json();

      setPendingDoctors(data);
    } catch (error) {
      console.error("Pending doctors error:", error);
      setAdminError(error.message);
    }
  };

  const handleDoctorBlockAction = async (userId, action) => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/admin/doctors/${userId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || `Unable to ${action} doctor`);
      }

      setAdminSuccess(
        action === "block"
          ? "Doctor blocked successfully!"
          : "Doctor unblocked successfully!",
      );

      // Refresh All Doctors list
      await handleLoadAdminDoctors();

      // Refresh notifications
      if (profile?.id) {
        const notificationResponse = await fetch(
          `${API_BASE_URL}/notifications/user/${profile.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();

          setNotifications(notificationData);
        }
      }
    } catch (error) {
      console.error("Doctor block/unblock error:", error);

      alert(error.message);
    }
  };

  const handleDoctorApproval = async (userId, action) => {
    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(
        `${API_BASE_URL}/admin/doctors/${userId}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || `Unable to ${action} doctor`);
      }

      setAdminSuccess(
        action === "approve"
          ? "Doctor approved successfully!"
          : "Doctor rejected successfully!",
      );

      // Refresh pending doctors
      await handleLoadPendingDoctors();

      // Refresh all doctors
      await handleLoadAdminDoctors();

      // Refresh Admin notifications
      if (profile?.id) {
        const notificationResponse = await fetch(
          `${API_BASE_URL}/notifications/user/${profile.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (notificationResponse.ok) {
          const notificationData = await notificationResponse.json();
          setNotifications(notificationData);
        }
      }
    } catch (error) {
      console.error("Doctor approval/rejection error:", error);
      alert(error.message);
    }
  };

  const handleLoadAdminAppointments = async () => {
    setIsLoadingAdmin(true);
    setAdminError("");

    try {
      const token = localStorage.getItem("docspotToken");

      const response = await fetch(`${API_BASE_URL}/admin/appointments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await response.json();
      setAdminAppointments(data);
    } catch (error) {
      console.error("Admin appointments error:", error);
      setAdminError(error.message);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // if (isLoggedIn) {
  // ================= ADMIN DASHBOARD =================
  if (userRole === "ADMIN") {
    return (
      <div className="admin-dashboard">
        {/* ================= ADMIN SIDEBAR ================= */}
        <aside className="admin-sidebar">
          {/* LOGO */}
          <div className="admin-sidebar-logo">
            <div className="admin-logo-icon">♥</div>

            <div>
              <div className="admin-logo-title">DocSpot</div>
              <div className="admin-logo-subtitle">Admin Portal</div>
            </div>
          </div>

          {/* ADMIN NAVIGATION */}
          <nav className="admin-sidebar-menu">
            <button
              className={`admin-sidebar-item ${
                adminSection === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("dashboard");
                handleLoadAdminDashboard();
              }}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className={`admin-sidebar-item ${
                adminSection === "users" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("users");
                handleLoadAdminUsers();
              }}
            >
              <span>👥</span>
              Users
            </button>

            <button
              className={`admin-sidebar-item ${
                adminSection === "patients" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("patients");
                handleLoadAdminPatients();
              }}
            >
              <span>👥</span>
              Patients
            </button>

            <button
              className={`admin-sidebar-item ${
                adminSection === "doctors" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("doctors");
                handleLoadAdminDoctors();
                handleLoadPendingDoctors();
              }}
            >
              <span>🩺</span>
              Doctors
            </button>

            <button
              className={`admin-sidebar-item ${
                adminSection === "appointments" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("appointments");
                handleLoadAdminAppointments();
              }}
            >
              <span>📅</span>
              Appointments
            </button>

            <button
              className={`admin-sidebar-item ${
                adminSection === "notifications" ? "active" : ""
              }`}
              onClick={() => {
                setAdminSection("notifications");
                handleViewNotifications();
              }}
            >
              <span>🔔</span>
              Notifications
              {notifications.filter((notification) => !notification.read)
                .length > 0 && (
                <span className="admin-notification-count">
                  {
                    notifications.filter((notification) => !notification.read)
                      .length
                  }
                </span>
              )}
            </button>
          </nav>

          {/* LOGOUT */}
          <div className="admin-sidebar-bottom">
            <button
              className="admin-sidebar-item admin-logout"
              onClick={() => {
                localStorage.removeItem("docspotToken");
                window.location.reload();
              }}
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* ================= ADMIN MAIN ================= */}
        <div className="admin-main">
          {/* TOP HEADER */}
          <header className="admin-topbar">
            <h1>DocSpot - Admin Dashboard 🩺</h1>

            <div className="admin-topbar-right">
              <button
                className="admin-top-notification"
                onClick={() => {
                  setAdminSection("notifications");
                  handleViewNotifications();
                }}
              >
                🔔
                {notifications.filter((notification) => !notification.read)
                  .length > 0 && (
                  <span className="admin-top-notification-count">
                    {
                      notifications.filter((notification) => !notification.read)
                        .length
                    }
                  </span>
                )}
              </button>

              <div className="admin-user">
                <div className="admin-avatar">
                  {(profile?.name || "A").charAt(0).toUpperCase()}
                </div>

                <div className="admin-user-info">
                  <strong>{profile?.name || "Admin"}</strong>
                  <span>Admin</span>
                </div>

                <span className="admin-dropdown"></span>
              </div>
            </div>
          </header>

          {adminSection === "" && (
            <div className="admin-welcome">
              <h2>Welcome, Admin! 👋</h2>
              <p>Manage users, doctors, patients and appointments from here.</p>
            </div>
          )}

          {/* ================= ADMIN CONTENT ================= */}
          <main className="admin-content">
            {/* ERROR */}

            {adminError && <div className="error-message">{adminError}</div>}
            {adminSuccess && (
              <div className="success-message">{adminSuccess}</div>
            )}

            {/* ================= ADMIN NOTIFICATIONS ================= */}

            {adminSection === "notifications" && (
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
                      onClick={() => setAdminSection("")}
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
                          {formatNotificationMessage(notification)}
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

            {/* LOADING */}

            {isLoadingAdmin && <p>Loading admin data...</p>}

            {/* ================= DASHBOARD ================= */}

            {adminSection === "dashboard" && adminStats && (
              <div className="admin-stats">
                <div className="admin-card">
                  <h3>👥 Total Users</h3>
                  <h2>{adminStats.totalUsers}</h2>
                </div>

                <div className="admin-card">
                  <h3>👩 Total Patients</h3>
                  <h2>{adminStats.totalPatients}</h2>
                </div>

                <div className="admin-card">
                  <h3>👨‍⚕️ Total Doctors</h3>
                  <h2>{adminStats.totalDoctors}</h2>
                </div>

                <div className="admin-card">
                  <h3>📅 Total Appointments</h3>
                  <h2>{adminStats.totalAppointments}</h2>
                </div>
              </div>
            )}

            {/* ================= USERS ================= */}

            {adminSection === "users" && (
              <div className="admin-table-container">
                <h2>All Users</h2>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                          {user.role === "DOCTOR"
                            ? formatDoctorName(user.name)
                            : user.name}
                        </td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= PATIENTS ================= */}

            {adminSection === "patients" && (
              <div className="admin-table-container">
                <h2>All Patients</h2>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td>{patient.id}</td>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.role}</td>
                        <td>
                          {patient.createdAt
                            ? new Date(patient.createdAt).toLocaleString()
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= DOCTORS ================= */}

            {/* ================= DOCTORS ================= */}

            {adminSection === "doctors" && (
              <div className="admin-table-container">
                {/* PENDING DOCTOR REQUESTS */}

                {/* PENDING DOCTOR REQUESTS */}

                <h2>⏳ Pending Doctor Registrations</h2>

                {pendingDoctors.length === 0 ? (
                  <p>No pending doctor registrations.</p>
                ) : (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {pendingDoctors.map((doctor) => (
                        <tr key={doctor.id}>
                          <td>{doctor.id}</td>

                          <td>{formatDoctorName(doctor.name)}</td>

                          <td>{doctor.email}</td>

                          <td>{doctor.role}</td>

                          <td>
                            {doctor.accountStatus === "ACTIVE" && "🟢 ACTIVE"}
                            {doctor.accountStatus === "PENDING" && "🟡 PENDING"}
                            {doctor.accountStatus === "REJECTED" &&
                              "🔴 REJECTED"}
                            {doctor.accountStatus === "BLOCKED" && "⚫ BLOCKED"}
                          </td>

                          <td>
                            {doctor.createdAt
                              ? new Date(doctor.createdAt).toLocaleString()
                              : "-"}
                          </td>

                          <td>
                            <button
                              className="primary-btn"
                              onClick={() =>
                                handleDoctorApproval(doctor.id, "approve")
                              }
                            >
                              ✅ Approve
                            </button>

                            <button
                              className="cancel-btn"
                              onClick={() =>
                                handleDoctorApproval(doctor.id, "reject")
                              }
                            >
                              ❌ Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* ALL DOCTORS */}

                <h2 style={{ marginTop: "30px" }}>👨‍⚕️ All Doctors</h2>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminDoctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>{doctor.id}</td>
                        <td>{formatDoctorName(doctor.name)}</td>

                        <td>{doctor.email}</td>

                        <td>{doctor.role}</td>

                        <td>
                          {doctor.accountStatus === "ACTIVE" && "🟢 ACTIVE"}
                          {doctor.accountStatus === "PENDING" && "🟡 PENDING"}
                          {doctor.accountStatus === "REJECTED" && "🔴 REJECTED"}
                          {doctor.accountStatus === "BLOCKED" && "⚫ BLOCKED"}
                        </td>

                        <td>
                          {doctor.createdAt
                            ? new Date(doctor.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          {doctor.accountStatus === "ACTIVE" && (
                            <button
                              className="cancel-btn"
                              onClick={() =>
                                handleDoctorBlockAction(doctor.id, "block")
                              }
                            >
                              🔒 Block
                            </button>
                          )}

                          {doctor.accountStatus === "BLOCKED" && (
                            <button
                              className="primary-btn"
                              onClick={() =>
                                handleDoctorBlockAction(doctor.id, "unblock")
                              }
                            >
                              🔓 Unblock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= APPOINTMENTS ================= */}

            {adminSection === "appointments" && (
              <div className="admin-table-container">
                <h2>All Appointments</h2>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                    </tr>
                  </thead>

                  <tbody>
                    {adminAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.id}</td>
                        <td>{appointment.patientName}</td>
                        <td>{formatDoctorName(appointment.doctorName)}</td>
                        <td>{appointment.specialization}</td>
                        <td>{appointment.appointmentDate}</td>
                        <td>{appointment.appointmentTime}</td>
                        <td>{appointment.status}</td>
                        <td>{appointment.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    if (userRole === "DOCTOR") {
      return (
        <div className="doctor-dashboard">
          {/* LEFT SIDEBAR */}
          <aside className="doctor-sidebar">
            <div className="doctor-sidebar-logo">
              <div className="doctor-logo-icon">♥</div>

              <div>
                <div className="doctor-logo-title">DocSpot</div>
                <div className="doctor-logo-subtitle">Doctor Portal</div>
              </div>
            </div>

            <nav className="doctor-sidebar-menu">
              <button
                className={`doctor-sidebar-item ${
                  doctorSection === "dashboard" ? "active" : ""
                }`}
                onClick={() => {
                  setDoctorSection("dashboard");
                  setShowDoctorAppointments(false);
                  setShowAvailabilityManager(false);
                  setDoctorProfile(null);
                  setShowNotifications(false);
                }}
              >
                <span>⌂</span>
                Dashboard
              </button>

              <button
                className={`doctor-sidebar-item ${
                  doctorSection === "profile" ? "active" : ""
                }`}
                onClick={() => {
                  setDoctorSection("profile");
                  setShowDoctorAppointments(false);
                  setShowAvailabilityManager(false);
                  setShowNotifications(false);
                  handleViewDoctorProfile();
                }}
              >
                <span>👤</span>
                My Profile
              </button>

              <button
                className={`doctor-sidebar-item ${
                  doctorSection === "availability" ? "active" : ""
                }`}
                onClick={() => {
                  setDoctorSection("availability");
                  setShowDoctorAppointments(false);
                  setDoctorProfile(null);
                  setShowNotifications(false);
                  setAvailabilityMessage("");
                  setShowAvailabilityManager(true);
                }}
              >
                <span>🗓️</span>
                Manage Availability
              </button>

              <button
                className={`doctor-sidebar-item ${
                  doctorSection === "appointments" ? "active" : ""
                }`}
                onClick={() => {
                  setDoctorSection("appointments");
                  setShowAvailabilityManager(false);
                  setDoctorProfile(null);
                  setShowNotifications(false);
                  handleViewDoctorAppointments();
                }}
              >
                <span>📅</span>
                My Appointment
              </button>

              <button
                className={`doctor-sidebar-item ${
                  doctorSection === "notifications" ? "active" : ""
                }`}
                onClick={handleViewNotifications}
              >
                <span>🔔</span>
                Notifications
                {notifications.filter((notification) => !notification.read)
                  .length > 0 && (
                  <span className="doctor-notification-count">
                    {
                      notifications.filter((notification) => !notification.read)
                        .length
                    }
                  </span>
                )}
              </button>
            </nav>

            <div className="doctor-sidebar-bottom">
              <button
                className="doctor-sidebar-item doctor-logout"
                onClick={() => {
                  localStorage.removeItem("docspotToken");
                  window.location.reload();
                }}
              >
                <span>↪</span>
                Logout
              </button>
            </div>
          </aside>

          {/* RIGHT SIDE */}
          <div className="doctor-main">
            {/* TOP HEADER */}
            <header className="doctor-topbar">
              <h1>DocSpot - Doctor Dashboard 🩺</h1>

              <div className="doctor-topbar-right">
                <button
                  className="doctor-top-notification"
                  onClick={handleViewNotifications}
                >
                  🔔
                  {notifications.filter((notification) => !notification.read)
                    .length > 0 && (
                    <span className="doctor-top-notification-count">
                      {
                        notifications.filter(
                          (notification) => !notification.read,
                        ).length
                      }
                    </span>
                  )}
                </button>

                <div className="doctor-user">
                  <div className="doctor-avatar">
                    {(profile?.name || "D").charAt(0).toUpperCase()}
                  </div>

                  <div className="doctor-user-info">
                    <strong>
                      {formatDoctorName(profile?.name || "Doctor")}
                    </strong>
                    <span>Doctor</span>
                  </div>

                  <span className="doctor-dropdown"></span>
                </div>
              </div>
            </header>

            <main className="dashboard-content">
              {/* Doctor Setup Status */}
              {doctorSection === "dashboard" &&
                profile?.accountStatus === "ACTIVE" &&
                !availabilityCompleted && (
                  <div className="doctor-setup-banner action-required">
                    <h2>🟢 Account Approved</h2>

                    <p>Your doctor account has been approved.</p>

                    <div className="setup-warning">
                      <h3>⚠️ Action Required</h3>

                      <p>
                        Complete Manage Availability to start receiving patient
                        appointments.
                      </p>

                      <button
                        className="primary-btn"
                        onClick={() => {
                          setShowAvailabilityManager(true);
                          setAvailabilityMessage("");
                        }}
                      >
                        Complete Availability
                      </button>
                    </div>
                  </div>
                )}

              {doctorSection === "dashboard" &&
                profile?.accountStatus === "ACTIVE" &&
                availabilityCompleted && (
                  <div className="doctor-setup-banner setup-completed">
                    <h2>🎉 Doctor Setup Completed!</h2>

                    <p>Your profile is ready.</p>

                    <p>Patients can now book appointments with you.</p>
                  </div>
                )}

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
                            {formatNotificationMessage(notification)}
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

              {doctorSection === "dashboard" && (
                <>
                  <h2>Welcome, Doctor 👋</h2>
                  <p>Manage your appointments and patients from here.</p>
                </>
              )}

              {showAvailabilityManager && (
                <div className="availability-manager">
                  <h2>🗓️ My Weekly Availability</h2>

                  <p>
                    Select the days and time when patients can book
                    appointments.
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
                        onChange={(e) =>
                          setAvailabilityStartTime(e.target.value)
                        }
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
                    <p className="availability-message">
                      {availabilityMessage}
                    </p>
                  )}

                  <button
                    className="primary-btn"
                    onClick={handleSaveAvailability}
                    disabled={isSavingAvailability}
                  >
                    {isSavingAvailability ? "Saving..." : "Save Availability"}
                  </button>
                </div>
              )}

              {showDoctorAppointments && (
                <div className="appointments-section">
                  <h2>📅 My Appointments</h2>

                  {isLoadingDoctorAppointments && (
                    <p>Loading appointments...</p>
                  )}

                  {doctorAppointmentsError && (
                    <p className="error-message">{doctorAppointmentsError}</p>
                  )}

                  {doctorAppointmentsSuccess && (
                    <p className="success-message">
                      {doctorAppointmentsSuccess}
                    </p>
                  )}

                  {!isLoadingDoctorAppointments &&
                    !doctorAppointmentsError &&
                    doctorAppointments.length === 0 && (
                      <p>No appointments found.</p>
                    )}

                  {!isLoadingDoctorAppointments && !doctorAppointmentsError && (
                    <div className="appointment-table-wrapper">
                      <table className="appointment-table">
                        <thead>
                          <tr>
                            <th>Patient</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {doctorAppointments.map((appointment) => (
                            <tr key={appointment.id}>
                              <td>👤 {appointment.patientName}</td>

                              <td>{appointment.appointmentDate}</td>

                              <td>{appointment.appointmentTime}</td>

                              <td>{appointment.reason}</td>

                              <td>
                                <span
                                  className={`status-badge ${appointment.status.toLowerCase()}`}
                                >
                                  {appointment.status}
                                </span>
                              </td>

                              <td>
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

                                {appointment.status === "CONFIRMED" &&
                                  new Date(
                                    `${appointment.appointmentDate}T${appointment.appointmentTime}`,
                                  ) <= new Date() && (
                                    <button
                                      className="primary-btn"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(
                                          appointment.id,
                                          "COMPLETED",
                                        )
                                      }
                                    >
                                      ✔️ Complete
                                    </button>
                                  )}

                                {appointment.status !== "PENDING" &&
                                  appointment.status !== "CONFIRMED" && (
                                    <span>—</span>
                                  )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                      <h3>
                        👨‍⚕️{" "}
                        {formatDoctorName(
                          doctorProfile.user?.name || profile?.name,
                        )}
                      </h3>

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
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      );
    }

    return (
      <div className="patient-dashboard">
        {/* LEFT SIDEBAR */}
        <aside className="patient-sidebar">
          <div className="patient-sidebar-logo">
            <div className="sidebar-logo-icon">♥</div>

            <div className="patient-logo-text">
              <span>DocSpot</span>
              <small>Patient Portal</small>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              className={`sidebar-item ${
                patientSection === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setPatientSection("dashboard");
                setShowDoctors(false);
                setShowAppointments(false);
                setShowProfile(false);
                setSelectedDoctor(null);
                setShowNotifications(false);
              }}
            >
              <span>⌂</span>
              Dashboard
            </button>

            <button
              className={`sidebar-item ${
                patientSection === "profile" ? "active" : ""
              }`}
              onClick={() => {
                setPatientSection("profile");
                setShowDoctors(false);
                setShowAppointments(false);
                setSelectedDoctor(null);
                setShowNotifications(false);
                handleViewProfile();
              }}
            >
              <span>👤</span>
              My Profile
            </button>

            <button
              className={`sidebar-item ${
                patientSection === "doctors" ? "active" : ""
              }`}
              onClick={() => {
                setPatientSection("doctors");
                setShowAppointments(false);
                setShowProfile(false);
                setSelectedDoctor(null);
                setSelectedSpecialization("");
                setShowNotifications(false);
                // handleFindDoctors();
              }}
            >
              <span>🩺</span>
              Find Doctors
            </button>

            <button
              className={`sidebar-item ${
                patientSection === "appointments" ? "active" : ""
              }`}
              onClick={() => {
                setPatientSection("appointments");
                setShowDoctors(false);
                setShowProfile(false);
                setSelectedDoctor(null);
                setShowNotifications(false);
                handleViewAppointments();
              }}
            >
              <span>📅</span>
              My Appointments
            </button>

            <button
              className={`sidebar-item ${
                patientSection === "notifications" ? "active" : ""
              }`}
              onClick={handleViewNotifications}
            >
              <span>🔔</span>
              Notifications
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
          </nav>

          <div className="sidebar-bottom">
            <button
              className="sidebar-item sidebar-logout"
              onClick={() => {
                localStorage.removeItem("docspotToken");
                window.location.reload();
              }}
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <div className="patient-main">
          {/* TOP BAR */}
          <header className="patient-topbar">
            <div className="patient-page-title">
              <span className="patient-menu-icon"></span>

              <h1>DocSpot - Patient Dashboard 🩺</h1>
            </div>

            <div className="patient-topbar-right">
              <button
                className="patient-notification-btn"
                onClick={handleViewNotifications}
              >
                🔔
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

              <div className="patient-user">
                <div className="patient-user-avatar">👤</div>

                <div>
                  <strong>{profile?.name || "Patient"}</strong>

                  <span>Patient</span>
                </div>
              </div>
            </div>
          </header>

          {patientSection === "notifications" && (
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
                    onClick={() => {
                      setShowNotifications(false);
                      setPatientSection("dashboard");
                    }}
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
                        {formatNotificationMessage(notification)}
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

          <main className="dashboard-content patient-dashboard">
            {patientSection === "dashboard" && (
              <div className="patient-welcome">
                <div className="patient-welcome-icon">👋</div>

                <h2>Welcome, {profile?.name || "Patient"}!</h2>

                <p>Manage your appointments and healthcare from here.</p>
                <p className="patient-welcome-subtext">
                  Your health matters. DocSpot helps you connect with trusted
                  doctors and manage your healthcare journey with ease.
                </p>
              </div>
            )}

            <div
              className={`dashboard-cards ${
                patientSection === "profile"
                  ? "profile-active"
                  : patientSection === "doctors"
                    ? "doctors-active"
                    : patientSection === "appointments"
                      ? "appointments-active"
                      : ""
              }`}
            >
              {patientSection === "doctors" && (
                <div className="dashboard-card doctor-search-card">
                  <h3>🔍 Find a Doctor</h3>

                  <select
                    value={selectedSpecialization}
                    onChange={(e) => {
                      setSelectedSpecialization(e.target.value);
                      setShowDoctors(true);
                    }}
                    className="specialization-select"
                  >
                    <option value="">Search by Specialization</option>

                    {[
                      ...new Set(
                        doctors.map((doctor) => doctor.specialization),
                      ),
                    ]
                      .filter(Boolean)
                      .sort()
                      .map((specialization) => (
                        <option key={specialization} value={specialization}>
                          {specialization}
                        </option>
                      ))}
                  </select>

                  <button
                    className="primary-btn"
                    onClick={() => {
                      setSelectedSpecialization("");
                      handleFindDoctors();
                    }}
                    disabled={isLoadingDoctors}
                  >
                    🩺 {isLoadingDoctors ? "Loading..." : "All Doctor Profiles"}
                  </button>
                </div>
              )}

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
                  {cancellationSuccess && (
                    <p className="success-message">{cancellationSuccess}</p>
                  )}
                  {!isLoadingAppointments &&
                    !appointmentsError &&
                    appointments.length === 0 && <p>No appointments found.</p>}

                  {!isLoadingAppointments &&
                    !appointmentsError &&
                    appointments.length > 0 && (
                      <div className="appointment-table-wrapper">
                        <table className="appointment-table">
                          <thead>
                            <tr>
                              <th>Doctor</th>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Reason</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {appointments.map((appointment) => (
                              <tr key={appointment.id}>
                                <td>
                                  {formatDoctorName(appointment.doctorName)}
                                </td>

                                <td>{appointment.appointmentDate}</td>

                                <td>{appointment.appointmentTime}</td>

                                <td>{appointment.reason}</td>

                                <td>
                                  <span
                                    className={`status-badge ${appointment.status.toLowerCase()}`}
                                  >
                                    {appointment.status}
                                  </span>
                                </td>

                                <td>
                                  {appointment.status === "PENDING" ? (
                                    <button
                                      className="cancel-btn"
                                      onClick={() =>
                                        handleCancelAppointment(appointment.id)
                                      }
                                    >
                                      Cancel
                                    </button>
                                  ) : (
                                    <span>—</span>
                                  )}

                                  {cancelAppointmentId === appointment.id && (
                                    <div className="cancel-confirmation">
                                      <p>
                                        Are you sure you want to cancel this
                                        appointment?
                                      </p>

                                      <button
                                        className="cancel-btn"
                                        onClick={() =>
                                          handleCancelAppointment(
                                            appointment.id,
                                            true,
                                          )
                                        }
                                      >
                                        Yes, Cancel
                                      </button>

                                      <button
                                        className="secondary-btn"
                                        onClick={() =>
                                          setCancelAppointmentId(null)
                                        }
                                      >
                                        Keep Appointment
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
              )}

              {patientSection === "profile" && (
                <div className="dashboard-card">
                  <h3>👤 My Profile</h3>
                  <p>View your DocSpot account information.</p>
                  <button className="primary-btn" onClick={handleViewProfile}>
                    View Profile
                  </button>
                </div>
              )}
            </div>

            {showProfile && (
              <div className="profile-section">
                <h2>My Profile</h2>

                {isLoadingProfile && <p>Loading profile...</p>}

                {profileError && (
                  <p className="error-message">{profileError}</p>
                )}

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
                  </div>
                )}
              </div>
            )}

            {showDoctors && !selectedDoctor && (
              <div className="doctors-section">
                <h2>
                  {selectedSpecialization
                    ? `${selectedSpecialization} Doctors`
                    : "Available Doctors"}
                </h2>

                {doctorError && <p className="doctor-error">{doctorError}</p>}

                {(() => {
                  const filteredDoctors = selectedSpecialization
                    ? doctors.filter(
                        (doctor) =>
                          doctor.specialization?.toLowerCase() ===
                          selectedSpecialization.toLowerCase(),
                      )
                    : doctors;

                  return filteredDoctors.length === 0 && !doctorError ? (
                    <p>
                      {selectedSpecialization
                        ? `No available doctors found for ${selectedSpecialization}.`
                        : "No doctors found."}
                    </p>
                  ) : (
                    <div className="doctor-list">
                      {filteredDoctors.map((doctor) => (
                        <div className="doctor-card" key={doctor.id}>
                          <h3>{formatDoctorName(doctor.doctorName)}</h3>

                          <p>
                            <strong>Specialization:</strong>{" "}
                            {doctor.specialization}
                          </p>

                          <p>
                            <strong>Qualification:</strong>{" "}
                            {doctor.qualification}
                          </p>

                          <p>
                            <strong>Experience:</strong> {doctor.experience}{" "}
                            years
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
                              setAppointmentsSuccess("");
                              setSelectedDoctor(doctor);
                              handleViewAvailability(doctor.id);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {showDoctors && !selectedDoctor && (
              <div className="doctor-close-section">
                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowDoctors(false);
                    setSelectedDoctor(null);
                    setSelectedSpecialization("");
                    setAvailability([]);
                    setAvailabilityError("");
                    setSelectedDate("");
                    setSelectedSlot(null);
                    setShowBookingForm(false);
                  }}
                >
                  ✕ Close Doctors
                </button>
              </div>
            )}

            {selectedDoctor && (
              <div className="doctor-details">
                {appointmentsSuccess && (
                  <p className="success-message">{appointmentsSuccess}</p>
                )}

                <h2>Doctor Details</h2>

                <h3>{formatDoctorName(selectedDoctor.doctorName)}</h3>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {selectedDoctor.specialization}
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

                {doctorHasAvailability && (
                  <div className="calendar-section">
                    <h3>📅 Select Appointment Date</h3>

                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(event) => handleDateChange(event.target.value)}
                    />
                  </div>
                )}

                {selectedDate && (
                  <div className="selected-date-section">
                    <h3>Available Slots for {selectedDate}</h3>

                    {isLoadingAvailability ? (
                      <p>Loading available slots...</p>
                    ) : availabilityError ? (
                      <p className="error-message">{availabilityError}</p>
                    ) : availability.length === 0 ? (
                      <p>
                        No available slots for the selected date. Please select
                        another date.
                      </p>
                    ) : (
                      <div className="time-slot-container">
                        {availability.map((slot) => {
                          const booked = slot.booked;

                          return (
                            <button
                              key={slot.id}
                              className={
                                booked
                                  ? "booked-slot-btn"
                                  : slot.past
                                    ? "past-slot-btn"
                                    : "primary-btn"
                              }
                              disabled={booked || slot.past}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowBookingForm(true);
                              }}
                            >
                              {slot.startTime.substring(0, 5)} -{" "}
                              {slot.endTime.substring(0, 5)}
                              {booked
                                ? "BOOKED 🔴"
                                : slot.past
                                  ? "PASSED"
                                  : "AVAILABLE 🟢"}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {showBookingForm && selectedSlot && (
                  <div className="booking-form">
                    <h3>Book Appointment</h3>

                    <p>
                      <strong>Doctor:</strong>{" "}
                      {formatDoctorName(selectedDoctor.doctorName)}
                    </p>

                    <p>
                      <strong>Date:</strong> {selectedSlot.availableDate}
                    </p>

                    <p>
                      <strong>Available Time:</strong> {selectedSlot.startTime}{" "}
                      - {selectedSlot.endTime}
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
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>

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
            <button
              className="primary-btn"
              onClick={() => {
                setShowRegister(true);
                setRegisterMessage("");
              }}
            >
              Get Started
            </button>

            <a href="#about" className="secondary-btn hero-link-btn">
              Learn More
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="hero-image-wrapper">
          <div className="hero-glow"></div>

          <div className="hero-image-card">
            <img
              src="/doctor-patient.jpeg"
              alt="Doctor consulting with patient"
              className="hero-doctor-image"
            />

            <div className="hero-floating-card">
              <span className="floating-icon">✓</span>

              <div>
                <strong>Trusted Healthcare</strong>
                <p>Qualified professionals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="section-heading">
          <p className="section-label">ABOUT DOCSPOT</p>

          <h2>
            Healthcare made simpler,
            <span> faster and accessible.</span>
          </h2>

          <p className="section-subtitle">
            DocSpot connects patients with healthcare professionals and makes
            the appointment process simple, convenient and organized.
          </p>
        </div>

        <div className="about-cards">
          <div className="about-card">
            <div className="about-icon">🩺</div>
            <h3>Verified Doctors</h3>
            <p>
              Connect with qualified healthcare professionals based on your
              healthcare needs.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">📅</div>
            <h3>Easy Booking</h3>
            <p>
              Choose a convenient date and available time slot to book your
              appointment.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon">🔐</div>
            <h3>Secure Access</h3>
            <p>
              Your account and appointment information are securely managed
              through DocSpot.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-heading">
          <p className="section-label">SIMPLE PROCESS</p>

          <h2>How It Works</h2>

          <p className="section-subtitle">
            Book your healthcare appointment in three simple steps.
          </p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>

            <div className="step-icon">👤</div>

            <h3>Create Your Account</h3>

            <p>
              Register securely as a patient and access your DocSpot account.
            </p>
          </div>

          <div className="step-line"></div>

          <div className="step-card">
            <div className="step-number">02</div>

            <div className="step-icon">🔎</div>

            <h3>Find Your Doctor</h3>

            <p>
              Explore doctors by specialization and view their profiles and
              availability.
            </p>
          </div>

          <div className="step-line"></div>

          <div className="step-card">
            <div className="step-number">03</div>

            <div className="step-icon">📅</div>

            <h3>Book Your Appointment</h3>

            <p>Select an available time slot and confirm your appointment.</p>
          </div>
        </div>
      </section>

      {/* Why Choose DocSpot */}
      <section className="why-docspot">
        <div className="section-heading">
          <p className="section-label">WHY DOCSPOT</p>

          <h2>Everything you need in one place.</h2>

          <p className="section-subtitle">
            Manage your healthcare appointments with a simple and convenient
            experience.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <span>🩺</span>
            <div>
              <h3>Trusted Healthcare</h3>
              <p>
                Connect with healthcare professionals through one convenient
                platform.
              </p>
            </div>
          </div>

          <div className="why-card">
            <span>📅</span>
            <div>
              <h3>Convenient Scheduling</h3>
              <p>Choose appointments according to doctor availability.</p>
            </div>
          </div>

          <div className="why-card">
            <span>🔔</span>
            <div>
              <h3>Real-Time Notifications</h3>
              <p>
                Stay updated about confirmations, cancellations and completed
                appointments.
              </p>
            </div>
          </div>

          <div className="why-card">
            <span>🔒</span>
            <div>
              <h3>Secure & Private</h3>
              <p>
                Your account and appointment information are securely managed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Specializations */}
      <section className="popular-specializations">
        <div className="section-heading">
          <p className="section-label">HEALTHCARE SPECIALIZATIONS</p>

          <h2>
            Popular <span>Specializations</span>
          </h2>

          <p className="section-subtitle">
            Explore healthcare specialists and find the right doctor for your
            needs.
          </p>
        </div>

        <div className="specialization-grid">
          {/* Always Visible */}
          <div className="specialization-card">
            <div className="specialization-icon">❤️</div>
            <h3>Cardiology</h3>
            <p>Heart & cardiovascular care</p>
          </div>

          <div className="specialization-card">
            <div className="specialization-icon">🧴</div>
            <h3>Dermatology</h3>
            <p>Skin, hair & nail care</p>
          </div>

          <div className="specialization-card">
            <div className="specialization-icon">🧠</div>
            <h3>Neurology</h3>
            <p>Brain & nervous system care</p>
          </div>

          <div className="specialization-card">
            <div className="specialization-icon">🦷</div>
            <h3>Dentistry</h3>
            <p>Dental & oral healthcare</p>
          </div>

          <div className="specialization-card">
            <div className="specialization-icon">👁️</div>
            <h3>Ophthalmology</h3>
            <p>Eye & vision care</p>
          </div>

          {/* Hidden Until View More */}

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🫁</div>
            <h3>Pulmonology</h3>
            <p>Lung & respiratory care</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🦴</div>
            <h3>Orthopedics</h3>
            <p>Bones, joints & muscles</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">👶</div>
            <h3>Pediatrics</h3>
            <p>Healthcare for children</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🤰</div>
            <h3>Gynecology</h3>
            <p>Women's healthcare</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🩺</div>
            <h3>General Medicine</h3>
            <p>General health & wellness</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🧪</div>
            <h3>Endocrinology</h3>
            <p>Hormones & metabolism</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🩸</div>
            <h3>Hematology</h3>
            <p>Blood & related disorders</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🧠</div>
            <h3>Psychiatry</h3>
            <p>Mental health & wellbeing</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">👂</div>
            <h3>ENT</h3>
            <p>Ear, nose & throat care</p>
          </div>

          <div className="specialization-card extra-specialization">
            <div className="specialization-icon">🫘</div>
            <h3>Urology</h3>
            <p>Urinary & reproductive care</p>
          </div>
        </div>

        {/* View More Button */}
        <button
          className="view-more-specializations"
          onClick={(e) => {
            const section = e.currentTarget.closest(".popular-specializations");

            section.classList.toggle("show-all-specializations");

            e.currentTarget.textContent = section.classList.contains(
              "show-all-specializations",
            )
              ? "View Less ↑"
              : "View More ↓";
          }}
        >
          View More ↓
        </button>
      </section>

      {/* Final Call To Action */}
      <section className="final-cta">
        <div>
          <p className="section-label">GET STARTED WITH DOCSPOT</p>

          <h2>Ready to take control of your healthcare?</h2>

          <p>
            Find the right doctor and manage your appointments with DocSpot.
          </p>
        </div>

        <button
          className="cta-button"
          onClick={() => {
            setShowRegister(true);
            setRegisterMessage("");
          }}
        >
          Get Started
        </button>
      </section>

      {/* Footer */}
      <footer>
        <h3>🩺 DocSpot</h3>

        <p>Seamless Appointment Booking for Health</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#how-it-works">How It Works</a>

          <button onClick={() => setShowLogin(true)}>Login</button>

          <button
            onClick={() => {
              setShowRegister(true);
              setRegisterMessage("");
            }}
          >
            Register
          </button>
        </div>

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
