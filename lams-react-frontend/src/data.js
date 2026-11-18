export const initialData = {
  users: [
    { id: 1, name: 'Amaya Perera', email: 'student@lams.lk', role: 'STUDENT', department: 'Computer Science' },
    { id: 2, name: 'Dr. Kasun Silva', email: 'lecturer@lams.lk', role: 'LECTURER', department: 'Computer Science', title: 'Senior Lecturer' },
    { id: 3, name: 'Nimali Fernando', email: 'admin@lams.lk', role: 'ADMIN', department: 'Administration' }
  ],
  lecturers: [
    { id: 2, name: 'Dr. Kasun Silva', title: 'Senior Lecturer', department: 'Computer Science', email: 'kasun@university.lk', bio: 'Software Engineering and Web Development' },
    { id: 4, name: 'Dr. Tharushi Jayawardena', title: 'Lecturer', department: 'Electronics', email: 'tharushi@university.lk', bio: 'Embedded Systems and IoT' },
    { id: 5, name: 'Mr. Nuwan Perera', title: 'Lecturer', department: 'Mathematics', email: 'nuwan@university.lk', bio: 'Applied Mathematics and Statistics' }
  ],
  slots: [
    { id: 1, lecturerId: 2, date: '2026-11-20', start: '09:00', end: '09:20', mode: 'Physical', location: 'Room B204', capacity: 2, booked: 1, active: true },
    { id: 2, lecturerId: 2, date: '2026-11-20', start: '10:00', end: '10:20', mode: 'Online', location: 'Meeting link provided after approval', capacity: 1, booked: 0, active: true },
    { id: 3, lecturerId: 4, date: '2026-11-21', start: '13:00', end: '13:30', mode: 'Physical', location: 'Electronics Lab', capacity: 3, booked: 0, active: true },
    { id: 4, lecturerId: 5, date: '2026-11-22', start: '11:00', end: '11:20', mode: 'Online', location: 'Online meeting', capacity: 1, booked: 0, active: true }
  ],
  appointments: [
    { id: 101, slotId: 1, studentId: 1, type: 'Individual', reason: 'Discuss assignment feedback', status: 'PENDING', lecturerNote: '', requestedAt: '2026-11-17 09:30', participants: [1] }
  ],
  notifications: [
    { id: 1, userId: 1, message: 'Your appointment request has been submitted.', read: false }
  ],
  departments: ['Computer Science', 'Electronics', 'Mathematics']
}
