import React from 'react';
import StudentDashboardView from '../../modules/student/StudentDashboardView';
import ErrorBoundary from '../../components/utils/ErrorBoundary';

const StudentDashboard = () => {
    return (
        <ErrorBoundary>
            <StudentDashboardView />
        </ErrorBoundary>
    );
};

export default StudentDashboard;
