import React from 'react';
import { useLocation } from 'react-router-dom';
import AssessmentResultsView from '../../modules/student/AssessmentResultsView';
import AssessmentHistoryView from '../../modules/student/AssessmentHistoryView';

const AssessmentResultsPage = () => {
    const location = useLocation();
    const hasResults = location.state && location.state.results;

    return hasResults ? <AssessmentResultsView /> : <AssessmentHistoryView />;
};

export default AssessmentResultsPage;
