/**
 * @license
 * Copyright 2020 Google LLC
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

import { ActionCodeSettings, Auth } from '@firebase/auth-types-exp';

import { GetOobCodeRequest } from '../../api/authentication/email_and_password';
import { AuthErrorCode } from '../errors';
import { assert } from '../util/assert';

export function _setActionCodeSettingsOnRequest(
  auth: Auth,
  request: GetOobCodeRequest,
  actionCodeSettings: ActionCodeSettings
): void {
  assert(
    actionCodeSettings.url.length > 0,
    AuthErrorCode.INVALID_CONTINUE_URI,
    {
      appName: auth.name
    }
  );
  assert(
    typeof actionCodeSettings.dynamicLinkDomain === 'undefined' ||
      actionCodeSettings.dynamicLinkDomain.length > 0,
    AuthErrorCode.INVALID_DYNAMIC_LINK_DOMAIN,
    {
      appName: auth.name
    }
  );

  request.continueUrl = actionCodeSettings.url;
  request.dynamicLinkDomain = actionCodeSettings.dynamicLinkDomain;
  request.canHandleCodeInApp = actionCodeSettings.handleCodeInApp;

  if (actionCodeSettings.iOS) {
    assert(
      actionCodeSettings.iOS.bundleId.length > 0,
      AuthErrorCode.MISSING_IOS_BUNDLE_ID,
      {
        appName: auth.name
      }
    );
    request.iosBundleId = actionCodeSettings.iOS.bundleId;
  }

  if (actionCodeSettings.android) {
    assert(
      actionCodeSettings.android.packageName.length > 0,
      AuthErrorCode.MISSING_ANDROID_PACKAGE_NAME,
      {
        appName: auth.name
      }
    );
    request.androidInstallApp = actionCodeSettings.android.installApp;
    request.androidMinimumVersionCode =
      actionCodeSettings.android.minimumVersion;
    request.androidPackageName = actionCodeSettings.android.packageName;
  }
}