"use client"
import React, { Suspense } from 'react';
import PayinComp from './payinComp';

export default function PayinWrapper({ src }: { src: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayinComp src={src} />
    </Suspense>
  );
}
