class WorkflowStateService{
    static getValidTransition(currentState){
        const transitions = {
            'Pending': ['In Progress', 'Closed'],
            'In Progress': ['Resloved', 'Closed'],
            'Resolved': ['Closed'],
            'Closed': []
        };
        return transitions[currentState]||[];
    }
    static isValidTransition(currentState, targetState){
        const validTransition = this.getValidTransition(currentState);
        return validTransition.includes(targetState);
    }
}
module.exports = WorkflowStateService;