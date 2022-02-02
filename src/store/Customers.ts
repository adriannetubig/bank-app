import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface CustomersState {
    isLoading: boolean;
    customers: Customer[];
    requestStarted: boolean;
}

export interface Customer {
    id: string;
    name: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestCustomersAction {
    type: 'REQUEST_CUSTOMERS';
}

interface ReceiveCustomersAction {
    type: 'RECEIVE_CUSTOMERS';
    customers: Customer[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestCustomersAction | ReceiveCustomersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestCustomers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.customers && !appState.customers.requestStarted) {
            appState.customers.requestStarted = true;
            fetch(`https://localhost:7293/customers`)
                .then(response => response.json() as Promise<Customer[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_CUSTOMERS', customers: data });
                });

            dispatch({ type: 'REQUEST_CUSTOMERS'});
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: CustomersState = { customers: [], isLoading: false, requestStarted: false };

export const reducer: Reducer<CustomersState> = (state: CustomersState | undefined, incomingAction: Action): CustomersState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_CUSTOMERS':
            return {
                customers: state.customers,
                isLoading: true,
                requestStarted: true
            };
        case 'RECEIVE_CUSTOMERS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            return {
                customers: action.customers,
                isLoading: false,
                requestStarted: true
            };
    }

    return state;
};
