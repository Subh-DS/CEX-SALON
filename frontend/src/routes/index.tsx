import { Route, Routes } from "react-router-dom";
import CustomerLayout from "@/layouts/CustomerLayout";
import StaffLayout from "@/layouts/StaffLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Landing from "@/pages/customer/Landing";
import Services from "@/pages/customer/Services";
import ServiceDetail from "@/pages/customer/ServiceDetail";
import Booking from "@/pages/customer/Booking";
import Login from "@/pages/customer/Login";
import Signup from "@/pages/customer/Signup";
import CustomerDashboard from "@/pages/customer/CustomerDashboard";
import Loyalty from "@/pages/customer/Loyalty";
import Rewards from "@/pages/customer/Rewards";
import StaffDashboard from "@/pages/staff/StaffDashboard";
import StaffLogin from "@/pages/staff/StaffLogin";
import StaffOverview from "@/pages/staff/StaffOverview";
import StaffAppointments from "@/pages/staff/StaffAppointments";
import StaffAppointmentDetail from "@/pages/staff/StaffAppointmentDetail";
import StaffCustomers from "@/pages/staff/StaffCustomers";
import StaffCustomerDetail from "@/pages/staff/StaffCustomerDetail";
import StaffServices from "@/pages/staff/StaffServices";
import StaffLoyalty from "@/pages/staff/StaffLoyalty";
import StaffAnalytics from "@/pages/staff/StaffAnalytics";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminServices from "@/pages/admin/AdminServices";
import AdminRewards from "@/pages/admin/AdminRewards";
import AdminReviews from "@/pages/admin/AdminReviews";
import NotFound from "@/pages/NotFound";
import { RequireAuth, RequireRole } from "./guards";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route index element={<Landing />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route element={<RequireAuth />}>
          <Route path="book" element={<Booking />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="loyalty" element={<Loyalty />} />
          <Route path="rewards" element={<Rewards />} />
        </Route>
      </Route>
      <Route path="staff/login" element={<StaffLogin />} />
      <Route element={<RequireRole roles={["staff", "admin"]} />}>
        <Route path="staff" element={<StaffLayout />}>
          <Route index element={<StaffOverview />} />
          <Route path="schedule" element={<StaffDashboard />} />
          <Route path="appointments" element={<StaffAppointments />} />
          <Route path="appointments/:id" element={<StaffAppointmentDetail />} />
          <Route path="customers" element={<StaffCustomers />} />
          <Route path="customers/:id" element={<StaffCustomerDetail />} />
          <Route path="services" element={<StaffServices />} />
          <Route path="loyalty" element={<StaffLoyalty />} />
          <Route path="analytics" element={<StaffAnalytics />} />
        </Route>
      </Route>
      <Route element={<RequireRole roles={["admin"]} />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="rewards" element={<AdminRewards />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
