class WorkflowStateService {
    static getValidTransitions(currentState) {
        const transitions = {
            'Pending': ['In Progress', 'Closed'],
            'In Progress': ['Resolved', 'Closed'],
            'Resolved': ['Closed'],
            'Closed': []
        };
        return transitions[currentState] || [];
    }

    static isValidTransition(currentState, targetState) {
        const validTransitions = this.getValidTransitions(currentState);
        return validTransitions.includes(targetState);
    }
}

module.exports = WorkflowStateService;