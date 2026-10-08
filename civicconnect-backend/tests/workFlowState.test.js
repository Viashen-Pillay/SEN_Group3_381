const WorkflowStateService = require('../src/services/WorkflowStateService');

describe('WorkflowStateService Unit Tests', () => {
    it('should allow valid transition from Pending to In Progress', () => {
        const isValid = WorkflowStateService.isValidTransition('Pending', 'In Progress');
        expect(isValid).toBe(true);
    });

    it('should allow valid transition from In Progress to Resolved', () => {
        const isValid = WorkflowStateService.isValidTransition('In Progress', 'Resolved');
        expect(isValid).toBe(true);
    });

    it('should reject invalid transition from Pending directly to Resolved (Negative Test)', () => {
        const isValid = WorkflowStateService.isValidTransition('Pending', 'Resolved');
        expect(isValid).toBe(false);
    });

    it('should reject transition from Closed back to Pending (Negative Test)', () => {
        const isValid = WorkflowStateService.isValidTransition('Closed', 'Pending');
        expect(isValid).toBe(false);
    });

    it('should return empty transitions array for Closed state (Boundary Test)', () => {
        const transitions = WorkflowStateService.getValidTransitions('Closed');
        expect(transitions).toEqual([]);
        expect(transitions.length).toBe(0);
    });
});