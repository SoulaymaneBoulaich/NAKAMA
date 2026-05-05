import { signupSchema } from './server/src/schemas/authSchema.js';
console.log('Signup Schema Shape:', Object.keys((signupSchema as any).shape || {}));
if ((signupSchema as any).shape?.body) {
  console.log('Body Schema Shape:', Object.keys((signupSchema as any).shape.body.shape || {}));
} else {
  console.log('NO BODY WRAPPER FOUND IN SCHEMA');
}
