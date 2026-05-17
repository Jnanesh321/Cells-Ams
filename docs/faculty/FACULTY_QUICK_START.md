# Faculty Module - Quick Start Guide

## 🚀 Getting Started

### Login Credentials (Faculty)

| ID | Name | Department |
|---|---|---|
| FAC_CSE01 | Dr. Rajeev Sharma | CSE |
| FAC_CSE02 | Prof. Deepa Shenoy | CSE |
| FAC_ECE01 | Dr. Niranjan Das | ECE |

**Password:** Any value (mock authentication)

## 📋 Dashboard Features

### Subject Cards
- **Color Indicators:**
  - 🟢 Green: Attendance marked today
  - 🟠 Amber: Marked in past
  - 🔴 Red: Not marked
- **Quick Navigation:** Tap card to start attendance marking

### Statistics Panel
- Assigned Students count
- Active Subjects count
- Subjects marked today

## 📊 Attendance Workflow

### Step 1: Subject Picker
```
Dashboard → Tap Subject Card (or "Mark Attendance")
↓
SubjectPicker Screen
```
- **Search:** Filter subjects by name/code
- **Section:** Select one section at a time
- **Date:** YYYY-MM-DD format (default: today)
- **Time:** HH:MM format (default: 09:00)
- **Student Count:** Shows number of students in section

### Step 2: Attendance Marking
```
SubjectPicker → "Start Attendance"
↓
AttendanceSessionScreen
```

**Quick Actions:**
- **Tap Status Badge** (P/A/OD): Cycle through statuses
- **Mark All P Button:** Mark entire section present
- **Search Bar:** Find student by name/USN
- **Tap Student Row:** Edit with reason

**Status Indicators:**
- 🟢 **P** (Present)
- 🔴 **A** (Absent)
- 🟡 **OD** (On Duty)

### Step 3: Edit Record (Optional)
```
Tap Student Row
↓
EditAttendanceScreen
```
- Select new status
- Enter reason (required if changing from current)
- Review audit warning
- Save changes

### Step 4: Review & Submit
```
"Review & Submit" Button
↓
ReviewSubmitScreen
```
- Verify attendance percentages
- Review absent students list
- Confirm important notes
- Submit

### Step 5: Confirmation
```
"Submit" Button
↓
SuccessConfirmationScreen
```
- Shows success message
- Displays submission summary
- Options: Mark Another / Go to Dashboard

## 🎨 UI Features

### Dark Theme
- Slate-900 background
- Slate-800 cards
- Blue-600 accents
- Color-coded status (green/red/amber)

### Responsive Design
- Optimized for mobile
- Smooth scrolling for large lists
- Touch-friendly buttons
- Tab navigation for module switching

### Accessibility
- Clear typography hierarchy
- High contrast colors
- Descriptive labels
- Helpful error messages

## ⚡ Tips & Tricks

1. **Quick Mark All:** Use "Mark All Present" for entire section
2. **Edit Mode:** Tap any student to provide reason for change
3. **Search:** Use search to find specific students
4. **Back Navigation:** Use "← Back" to return to previous screen
5. **Auto-Redirect:** Success screen auto-dismisses after 5 seconds

## 🔧 State Management

### What's Saved Locally
- Current session (in memory)
- Student status changes (in memory)
- Edit reasons (in memory)
- Session metadata

### What's NOT Saved
- All data cleared on app restart
- No persistence to device yet
- Edits not sent to backend yet

## 📱 Mobile Testing Checklist

- [ ] Dashboard loads with assigned subjects
- [ ] Subject cards show correct attendance status
- [ ] Can search subjects
- [ ] Can select sections
- [ ] Can mark attendance with toggles
- [ ] "Mark All Present" works
- [ ] Search students feature works
- [ ] Can edit individual student
- [ ] Reason required for edits
- [ ] Review screen shows correct stats
- [ ] Submit works (mock success)
- [ ] Success screen displays
- [ ] Can mark another subject
- [ ] Can return to dashboard
- [ ] Dark theme looks good
- [ ] Responsive on different screen sizes

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Subject not appearing | Check faculty ID matches assignment |
| Section not selectable | Verify section is in subject.sections array |
| Can't submit | Ensure reason provided for changed records |
| Status not updating | Try toggling again or refresh |
| Performance slow | App handles 40+ students smoothly |

## 📞 Need Help?

- Check FACULTY_MODULE_COMPLETE.md for full documentation
- Review types in src/types/index.ts
- Check mock data in src/mock/faculty.ts
- Review store in src/store/attendance.ts

---

**Last Updated:** 2026-05-11
**Version:** 1.0.0
**Status:** ✅ Ready for Testing
