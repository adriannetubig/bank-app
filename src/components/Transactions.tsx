import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { ApplicationState } from '../store';
import * as TransactionsStore from '../store/Transactions';

// At runtime, Redux will merge together...
type TransactionProps =
  TransactionsStore.TransactionsState // ... state we've requested from the Redux store
  & typeof TransactionsStore.actionCreators; // ... plus action creators we've requested


class FetchData extends React.PureComponent<TransactionProps> {
  // This method is called when the component is first added to the document
  public componentDidMount() {
    this.ensureDataFetched();
  }

  // This method is called when the route parameters change
  public componentDidUpdate() {
    this.ensureDataFetched();
  }

  public render() {
    return (
      <React.Fragment>
        <h1 id="tabelLabel">Transactions</h1>
        {this.renderTransactionsTable()}
      </React.Fragment>
    );
  }

  private ensureDataFetched() {
    this.props.requestTransactions();
  }

  private renderTransactionsTable() {
    return (
      <table className='table table-striped' aria-labelledby="tabelLabel">
        <thead>
          <tr>
            <th>Id</th>
            <th>fromAccount</th>
            <th>toAccount</th>
            <th>description</th>
            <th>amount</th>
            <th>date</th>
          </tr>
        </thead>
        <tbody>
          {this.props.transactions.map((forecast: TransactionsStore.Transaction) =>
            <tr key={forecast.date}>
              <td>{forecast.id}</td>
              <td>{forecast.fromAccount}</td>
              <td>{forecast.toAccount}</td>
              <td>{forecast.description}</td>
              <td>{forecast.amount}</td>
              <td>{forecast.date}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

export default connect(
  (state: ApplicationState) => state.transactions, // Selects which state properties are merged into the component's props
  TransactionsStore.actionCreators // Selects which action creators are merged into the component's props
)(FetchData as any); // eslint-disable-line @typescript-eslint/no-explicit-any
