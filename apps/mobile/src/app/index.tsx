import React from 'react';
import { Redirect } from 'expo-router';
import { getAccessToken } from '../lib/api';

export default function IndexRedirect() {
  const token = getAccessToken();

  if (token) {
    return <Redirect href="/step/2" />;
  }

  return <Redirect href="/step/1" />;
}
