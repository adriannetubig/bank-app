import { Action, Reducer } from 'redux';
import { AppThunkAction } from './';

// -----------------
// STATE - This defines the type of data maintained in the Redux store.

export interface AccountNumbersState {
    isLoading: boolean;
    accountNumbers: AccountNumber[];
    requestStarted: boolean;
}

export interface AccountNumber {
    id: string;
    name: string;
}

// -----------------
// ACTIONS - These are serializable (hence replayable) descriptions of state transitions.
// They do not themselves have any side-effects; they just describe something that is going to happen.

interface RequestAccountNumbersAction {
    type: 'REQUEST_ACCOUNTNUMBERS';
}

interface ReceiveAccountNumbersAction {
    type: 'RECEIVE_ACCOUNTNUMBERS';
    accountNumbers: AccountNumber[];
}

// Declare a 'discriminated union' type. This guarantees that all references to 'type' properties contain one of the
// declared type strings (and not any other arbitrary string).
type KnownAction = RequestAccountNumbersAction | ReceiveAccountNumbersAction;

// ----------------
// ACTION CREATORS - These are functions exposed to UI components that will trigger a state transition.
// They don't directly mutate state, but they can have external side-effects (such as loading data).

export const actionCreators = {
    requestAccountNumbers: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        // Only load data if it's something we don't already have (and are not already loading)
        const appState = getState();
        if (appState && appState.accountNumbers && !appState.accountNumbers.requestStarted) {
            appState.accountNumbers.requestStarted = true;
            fetch(`https://localhost:7293/accountNumbers`)
                .then(response => response.json() as Promise<AccountNumber[]>)
                .then(data => {
                    dispatch({ type: 'RECEIVE_ACCOUNTNUMBERS', accountNumbers: data });
                });

            dispatch({ type: 'REQUEST_ACCOUNTNUMBERS'});
        }
    }
};

// ----------------
// REDUCER - For a given state and action, returns the new state. To support time travel, this must not mutate the old state.

const unloadedState: AccountNumbersState = { accountNumbers: [], isLoading: false, requestStarted: false };

export const reducer: Reducer<AccountNumbersState> = (state: AccountNumbersState | undefined, incomingAction: Action): AccountNumbersState => {
    if (state === undefined) {
        return unloadedState;
    }

    const action = incomingAction as KnownAction;
    switch (action.type) {
        case 'REQUEST_ACCOUNTNUMBERS':
            return {
                accountNumbers: state.accountNumbers,
                isLoading: true,
                requestStarted: true
            };
        case 'RECEIVE_ACCOUNTNUMBERS':
            // Only accept the incoming data if it matches the most recent request. This ensures we correctly
            // handle out-of-order responses.
            return {
                accountNumbers: action.accountNumbers,
                isLoading: false,
                requestStarted: true
            };
    }

    return state;
};
