/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { deepEqual } from '@firebase/util';

import { AggregateImpl } from '../core/aggregate';
import { AggregateAlias } from '../model/aggregate_alias';
import { ObjectValue } from '../model/object_value';
import { invokeRunAggregationQueryRpc } from '../remote/datastore';
import { cast } from '../util/input_validation';
import { mapToArray } from '../util/obj';

import {
  AggregateField,
  AggregateQuerySnapshot,
  AggregateSpec
} from './aggregate_types';
import { getDatastore } from './components';
import { Firestore } from './database';
import { FieldPath } from './field_path';
import {DocumentData, Query, queryEqual} from './reference';
import { LiteUserDataWriter } from './reference_impl';
import { fieldPathFromArgument } from './user_data_reader';

/**
 * Calculates the number of documents in the result set of the given query,
 * without actually downloading the documents.
 *
 * Using this function to count the documents is efficient because only the
 * final count, not the documents' data, is downloaded. This function can even
 * count the documents if the result set would be prohibitively large to
 * download entirely (e.g. thousands of documents).
 *
 * @param query - The query whose result set size to calculate.
 * @returns A Promise that will be resolved with the count; the count can be
 * retrieved from `snapshot.data().count`, where `snapshot` is the
 * `AggregateQuerySnapshot` to which the returned Promise resolves.
 */
export function getCount<AppType = DocumentData, DbType extends DocumentData = AppType extends DocumentData ? AppType : DocumentData>(
  query: Query<AppType, DbType>
): Promise<AggregateQuerySnapshot<{ count: AggregateField<number> }, AppType, DbType>> {
  const countQuerySpec: { count: AggregateField<number> } = {
    count: count()
  };

  return getAggregate(query, countQuerySpec);
}

/**
 * Calculates the specified aggregations over the documents in the result
 * set of the given query, without actually downloading the documents.
 *
 * Using this function to perform aggregations is efficient because only the
 * final aggregation values, not the documents' data, is downloaded. This
 * function can even perform aggregations of the documents if the result set
 * would be prohibitively large to download entirely (e.g. thousands of documents).
 *
 * @param query The query whose result set to aggregate over.
 * @param aggregateSpec An `AggregateSpec` object that specifies the aggregates
 * to perform over the result set. The AggregateSpec specifies aliases for each
 * aggregate, which can be used to retrieve the aggregate result.
 * @example
 * ```typescript
 * const aggregateSnapshot = await getAggregate(query, {
 *   countOfDocs: count(),
 *   totalHours: sum('hours'),
 *   averageScore: average('score')
 * });
 *
 * const countOfDocs: number = aggregateSnapshot.data().countOfDocs;
 * const totalHours: number = aggregateSnapshot.data().totalHours;
 * const averageScore: number | null = aggregateSnapshot.data().averageScore;
 * ```
 * @internal TODO (sum/avg) remove when public
 */
export function getAggregate<AggregateSpecType extends AggregateSpec, AppType = DocumentData, DbType extends DocumentData = AppType extends DocumentData ? AppType : DocumentData>(
  query: Query<AppType, DbType>,
  aggregateSpec: AggregateSpecType
): Promise<AggregateQuerySnapshot<AggregateSpecType, AppType, DbType>> {
  const firestore = cast(query.firestore, Firestore);
  const datastore = getDatastore(firestore);

  const internalAggregates = mapToArray(aggregateSpec, (aggregate, alias) => {
    return new AggregateImpl(
      new AggregateAlias(alias),
      aggregate._aggregateType,
      aggregate._internalFieldPath
    );
  });

  // Run the aggregation and convert the results
  return invokeRunAggregationQueryRpc(
    datastore,
    query._query,
    internalAggregates
  ).then(aggregateResult =>
    convertToAggregateQuerySnapshot(firestore, query, aggregateResult)
  );
}

function convertToAggregateQuerySnapshot<AggregateSpecType extends AggregateSpec, AppType = DocumentData, DbType extends DocumentData = AppType extends DocumentData ? AppType : DocumentData>(
  firestore: Firestore,
  query: Query<AppType, DbType>,
  aggregateResult: ObjectValue
): AggregateQuerySnapshot<AggregateSpecType, AppType, DbType> {
  const userDataWriter = new LiteUserDataWriter(firestore);
  const querySnapshot = new AggregateQuerySnapshot<AggregateSpecType, AppType, DbType>(query, userDataWriter, aggregateResult);
  return querySnapshot;
}

/**
 * Create an AggregateField object that can be used to compute the sum of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to sum across the result set.
 * @internal TODO (sum/avg) remove when public
 */
export function sum(field: string | FieldPath): AggregateField<number> {
  return new AggregateField('sum', fieldPathFromArgument('sum', field));
}

/**
 * Create an AggregateField object that can be used to compute the average of
 * a specified field over a range of documents in the result set of a query.
 * @param field Specifies the field to average across the result set.
 * @internal TODO (sum/avg) remove when public
 */
export function average(
  field: string | FieldPath
): AggregateField<number | null> {
  return new AggregateField('avg', fieldPathFromArgument('average', field));
}

/**
 * Create an AggregateField object that can be used to compute the count of
 * documents in the result set of a query.
 * @internal TODO (sum/avg) remove when public
 */
export function count(): AggregateField<number> {
  return new AggregateField('count');
}

/**
 * Compares two 'AggregateField` instances for equality.
 *
 * @param left Compare this AggregateField to the `right`.
 * @param right Compare this AggregateField to the `left`.
 * @internal TODO (sum/avg) remove when public
 */
export function aggregateFieldEqual(
  left: AggregateField<unknown>,
  right: AggregateField<unknown>
): boolean {
  return (
    left instanceof AggregateField &&
    right instanceof AggregateField &&
    left._aggregateType === right._aggregateType &&
    left._internalFieldPath?.canonicalString() ===
      right._internalFieldPath?.canonicalString()
  );
}

/**
 * Compares two `AggregateQuerySnapshot` instances for equality.
 *
 * Two `AggregateQuerySnapshot` instances are considered "equal" if they have
 * underlying queries that compare equal, and the same data.
 *
 * @param left - The first `AggregateQuerySnapshot` to compare.
 * @param right - The second `AggregateQuerySnapshot` to compare.
 *
 * @returns `true` if the objects are "equal", as defined above, or `false`
 * otherwise.
 */
export function aggregateQuerySnapshotEqual<T extends AggregateSpec>(
  left: AggregateQuerySnapshot<T>,
  right: AggregateQuerySnapshot<T>
): boolean {
  return (
    queryEqual(left.query, right.query) && deepEqual(left.data(), right.data())
  );
}
