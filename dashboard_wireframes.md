
# Vision Care Plus Eye Health Platform - Dashboard Wireframes

## 🔷 1. Admin Dashboard

```
+----------------------------------------------------------------------------------------------------+
| [Logo] VisionCare Plus | [ Global Search Bar (Patient Name, ID, Appointment) ] | [🔔 Notif] [👤 Profile] |
+----------------------------------------------------------------------------------------------------+
| Sidebar Menu (Vertical)                                                                            |
|----------------------------------------------------------------------------------------------------|
| [📊 Dashboard]                                                                                      |
| [👥 Patients]                                                                                       |
| [📅 Appointments]                                                                                   |
| [📄 EMR]                                                                                            |
| [💰 Billing]                                                                                        |
| [📈 Reports & Analytics]                                                                            |
| [⚙️ Settings]                                                                                       |
| ... (other admin-specific links)                                                                   |
|----------------------------------------------------------------------------------------------------|
| Main Dashboard Area (Admin View)                                                                   |
|                                                                                                    |
|   +-----------------------------+  +--------------------------------+  +---------------------------+
|   | KPI Overview                |  | Doctor Performance (Table)     |  | Appointment Status (Pie)  |
|   | - Total Patients: ###       |  | - Dr. A: 5/5 | Appts: ##      |  | - Booked: 60%             |
|   | - Today's Appts: ##         |  | - Dr. B: 4/5 | Appts: ##      |  | - Completed: 20%          |
|   | - Total Revenue: $##,###    |  | (Scrollable List/Table)        |  | - Canceled: 10%           |
|   | - Pending Dues: $#,###      |  |                                |  | - No-shows: 10%           |
|   +-----------------------------+  +--------------------------------+  +---------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Finance Trends (Graph)                                                                         |
|   | [ Line Graph showing Daily/Weekly/Monthly Revenue ]                                            |
|   | [ Filters: Date Range ]                                                                        |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Insurance Claims (Table)                                                                       |
|   | | Claim ID | Patient | Insurer | Amount | Status (Pending/Approved) | [Action: Review] |     |
|   | (Scrollable Table with Pagination)                                                             |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------------------+  +-----------------------------------------------------+
|   | Recent Activity Feed                 |  | System Health                                       |
|   | - User X updated Patient Y EMR (time)|  | - DB Backup: OK (timestamp)                         |
|   | - Admin Z logged in (time)           |  | - Integrations: Twilio (✅), OCT (⚠️), Payment (✅)   |
|   | - New patient registered (time)      |  | - Error Logs: 3 new (link to logs)                  |
|   | (Scrollable List)                    |  |                                                     |
|   +--------------------------------------+  +-----------------------------------------------------+
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

## 🟢 2. Doctor Dashboard

```
+----------------------------------------------------------------------------------------------------+
| [Logo] VisionCare Plus | [ Global Search Bar ]                                 | [🔔 Notif] [👤 Profile] |
+----------------------------------------------------------------------------------------------------+
| Sidebar Menu (Vertical)                                                                            |
|----------------------------------------------------------------------------------------------------|
| [📊 Dashboard]                                                                                      |
| [👥 Patients]                                                                                       |
| [📅 Appointments]                                                                                   |
| [📄 EMR]                                                                                            |
| [🔬 Diagnostic Tools]                                                                               |
| ... (other doctor-specific links)                                                                  |
|----------------------------------------------------------------------------------------------------|
| Main Dashboard Area (Doctor View)                                                                  |
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Today’s Appointments                                                                           |
|   | +--------------------------------------------------------------------------------------------+ |
|   | | 09:00 AM | John Doe   | Glaucoma Check | [Video Call Icon] [View EMR] [Notes]              | |
|   | | 09:30 AM | Jane Smith | Follow-up      | [Video Call Icon] [View EMR] [Notes]              | |
|   | | ... (Scrollable List)                                                                      | |
|   | +--------------------------------------------------------------------------------------------+ |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------+   +---------------------------+   +---------------------------------+
|   | Pending EMRs             |   | Quick Diagnostic Upload   |   | Patient Alerts                  |
|   | - Count: 3               |   | [ Button: Upload OCT ]    |   | - Jane Smith: Allergy to X      |
|   | [ View List -> ]         |   | [ Button: Upload Fundus ] |   | - John Doe: High IOP (date)     |
|   |                          |   | [ Button: Slit Lamp Pic ] |   | (Scrollable List, Clickable)    |
|   +--------------------------+   +---------------------------+   +---------------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Performance Summary                                                                            |
|   | - Patients Seen Today: ##                                                                      |
|   | - Avg. Feedback Score: 4.5/5                                                                   |
|   | - Avg. Visit Time: 15 mins                                                                     |
|   | [ View Detailed Reports -> ]                                                                   |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   [ Floating Action Button (FAB): + New Prescription / + Quick Note ] (Optional)                     |
+----------------------------------------------------------------------------------------------------+
```

## 🟡 3. Reception Dashboard

```
+----------------------------------------------------------------------------------------------------+
| [Logo] VisionCare Plus | [ Global Search Bar (Patient, Appointment) ]          | [🔔 Notif] [👤 Profile] |
+----------------------------------------------------------------------------------------------------+
| Sidebar Menu (Vertical)                                                                            |
|----------------------------------------------------------------------------------------------------|
| [📊 Dashboard]                                                                                      |
| [👥 Patient Registration]                                                                           |
| [📅 Appointments]                                                                                   |
| [💰 Billing (Quick Links)]                                                                          |
| ... (other receptionist-specific links)                                                            |
|----------------------------------------------------------------------------------------------------|
| Main Dashboard Area (Reception View)                                                               |
|                                                                                                    |
|   +------------------------------------------------------+  +-------------------------------------+
|   | Appointment Queue (Live)                             |  | Book New Appointment                |
|   | - 10:00 Dr. A - J. Doe (Checked In) [Notify Dr]      |  | Patient: [Search/Select Patient   ] |
|   | - 10:15 Dr. B - A. Bee (Waiting)  [ETA: 5m]          |  | Doctor: [Select Doctor            ] |
|   | - 10:30 Dr. A - C. See (Scheduled)                     |  | Date:   [Date Picker              ] |
|   | (Scrollable, Auto-refreshing List)                   |  | Time:   [Time Slot Picker         ] |
|   |                                                      |  | Type:   [Consult/Follow-up/Other  ] |
|   |                                                      |  | [ Button: Check Availability ]      |
|   |                                                      |  | [ Button: Book Appointment   ]      |
|   +------------------------------------------------------+  +-------------------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Daily Calendar View (Draggable Appointments, Color-coded statuses)                             |
|   | [ Visual Calendar Grid for the Day/Week ]                                                      |
|   | [ Filters: Doctor, Room ]                                                                      |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +---------------------------+  +---------------------------+  +----------------------------------+
|   | Billing Overview (Today)  |  | Upcoming Patient Alerts   |  | Waiting Room Status              |
|   | - Income: $####           |  | - P. Xyz: Insurance Exp.  |  | - Dr. A: 3 waiting (Avg: 10m)    |
|   | - Dues Pending: $###      |  | - A. Bcd: Special Needs   |  | - Dr. B: 1 waiting (Avg: 5m)     |
|   | - Invoices: ##            |  | (Clickable List)          |  | (Real-time updates)              |
|   | [ Go to Full Billing -> ] |  |                           |  |                                  |
|   +---------------------------+  +---------------------------+  +----------------------------------+
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

## 🔵 4. Patient Dashboard

```
+----------------------------------------------------------------------------------------------------+
| [Logo] VisionCare Plus |                                                       | [🔔 Notif] [👤 Profile] |
+----------------------------------------------------------------------------------------------------+
| Sidebar Menu (Vertical - Simplified for Patient)                                                   |
|----------------------------------------------------------------------------------------------------|
| [📊 Dashboard]                                                                                      |
| [📅 My Appointments]                                                                                |
| [📄 My Medical Records]                                                                             |
| [💊 My Prescriptions]                                                                               |
| [💰 My Billing]                                                                                     |
| [⚙️ My Profile Settings]                                                                            |
|----------------------------------------------------------------------------------------------------|
| Main Dashboard Area (Patient View) - Welcome, [Patient Name]!                                      |
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Upcoming Appointments                                                                          |
|   | - Aug 15, 10:00 AM with Dr. Smith [Reschedule] [Cancel] [Join Teleconsult] [Add to Calendar]   |
|   | - Sep 01, 02:30 PM with Dr. Jones [Reschedule] [Cancel]                                        |
|   | (If no appointments, show "No upcoming appointments. [Book Now]")                              |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +--------------------------+   +---------------------------+   +---------------------------------+
|   | Medical Records          |   | Prescriptions             |   | Payment History                 |
|   | - Last Visit: Jul 20     |   | - Metformin (Refill Due)  |   | - Invoice #123: $50 (Paid)      |
|   | - Recent Test: Eye Exam  |   | - Eyedrops (Active)       |   |   [Download Receipt]            |
|   | [ View All Records -> ]  |   | [ View All Presc. -> ]    |   | [ View All Payments -> ]        |
|   +--------------------------+   +---------------------------+   +---------------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Reminders & Alerts                                                                             |
|   | - Medication Reminder: Take Metformin at 8 PM                                                  |
|   | - Annual Check-up due: November 2025                                                           |
|   | - New message from Dr. Smith [View Message]                                                    |
|   | (Scrollable List)                                                                              |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
|   +------------------------------------------------------------------------------------------------+
|   | Teleconsultation Hub                                                                           |
|   | [ If active call: Button: Join Secure Video Call with Dr. X ]                                  |
|   | [ Else: Information about how to schedule or prepare for a teleconsult ]                       |
|   | [ Checklist: Test Audio, Test Video, Stable Internet ]                                         |
|   +------------------------------------------------------------------------------------------------+
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

This provides a text-based wireframe for each dashboard, outlining the main components and their general placement, similar to how one might start sketching in a tool like Figma.

