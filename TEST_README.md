# Frontend API Test Documentation

This document explains the simplified test suite for testing the Angular frontend API service.

## 🎯 Test Focus

**ONLY Frontend API Tests** - Testing Angular service communication with FastAPI backend endpoints.

## 📁 Test Structure

```
tests/
└── api.service.spec.ts    # Frontend API service tests (ONLY)
```

## 🧪 Test Cases

### API Service Tests (`tests/api.service.spec.ts`)

**3 Essential Test Cases:**

1. **✅ Successful API Communication**
   - Tests POST request to `/api/chat` endpoint
   - Validates request format: `{ query: "message" }`
   - Verifies response structure: `{ content: "...", metadata: {...} }`
   - Confirms Content-Type headers are correct

2. **✅ Internal Server Error Handling (500)**
   - Tests error handling for server failures
   - Verifies error propagation to frontend components

3. **✅ Service Unavailable Error (503)**
   - Tests handling when agent service is not initialized
   - Ensures graceful error handling

## 🚀 Running the Tests

### Frontend API Tests Only
```bash
# Run just the API service tests
npm run test -- --include='**/api.service.spec.ts'

# Run all tests (only API tests exist now)
npm run test

# Run with coverage
npm run test -- --code-coverage
```

## 🔧 GitHub Actions Pipeline

### Simplified Workflow (`frontend-api-tests-ci-cd.yml`)
- ✅ **Environment**: Node.js 18
- ✅ **Tests**: Only frontend API service tests
- ✅ **Build & Deploy**: After tests pass

### Pipeline Jobs
1. **Frontend API Tests**: Runs API service unit tests
2. **Build & Deploy**: Deploys to Azure Static Web Apps

## 📊 What Gets Tested

### ✅ API Communication
- HTTP POST requests to `/api/chat`
- Request body format validation
- Response structure validation
- HTTP headers verification

### ✅ Error Handling
- 500 Internal Server Error responses
- 503 Service Unavailable responses
- Error propagation to components

### ✅ Data Validation
- ChatRequest format: `{ query: string }`
- ChatResponse format: `{ content: string, metadata?: object }`
- Content length validation
- Metadata structure validation

## 🛠️ Configuration

### Environment Variables
```typescript
// From environment.ts
apiConfig: {
  baseUrl: 'http://0.0.0.0:8000',  // Development
  endpoints: {
    chat: '/api/chat'
  }
}

// From environment.prod.ts  
apiConfig: {
  baseUrl: 'https://jonas.victorioussmoke-3dca34aa.westus2.azurecontainerapps.io',  // Production
  endpoints: {
    chat: '/api/chat'
  }
}
```

### Test Requirements
- ✅ Angular testing utilities
- ✅ HttpClientTestingModule for HTTP mocking
- ✅ Jasmine/Karma test framework
- ✅ No backend server required (uses mocked HTTP calls)

## 🎯 Benefits of This Simplified Approach

1. **Fast Execution**: No backend dependencies
2. **Reliable**: Mocked HTTP responses ensure consistent results
3. **Focused**: Only tests what matters - API communication
4. **CI/CD Friendly**: No complex server setup required
5. **Maintainable**: Minimal test surface area

## 🔍 Test Coverage

- ✅ **API Service Creation**: Service instantiation
- ✅ **HTTP Requests**: Proper request formatting
- ✅ **Response Handling**: Correct response parsing
- ✅ **Error Scenarios**: Server error handling
- ✅ **TypeScript Models**: Request/Response type validation

## 📈 Running in CI/CD

The GitHub Actions pipeline automatically:
1. Sets up Node.js 18 environment
2. Installs npm dependencies
3. Runs the API service tests
4. Generates coverage reports
5. Deploys on success

**Simple, focused, and reliable!** 🚀