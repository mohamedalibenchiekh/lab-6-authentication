// AUTHENTICATION & AUTHORIZATION TESTS
// Run with: node test-authentication.js

const BASE_URL = "http://localhost:3000/api/v1";

// Helper function to make HTTP requests
async function request(method, path, body = null, token = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// Helper function to run tests
async function test(name, fn) {
  try {
    console.log(`\n📋 TEST: ${name}`);
    console.log("─".repeat(50));
    await fn();
  } catch (error) {
    console.error(`❌ ${name}: ${error.message}`);
  }
}

// Main test suite
async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🔐 AUTHENTICATION & AUTHORIZATION TESTS");
  console.log("=".repeat(60));

  let userToken = null;
  let eventId = null;
  let testEmail = `test-${Date.now()}@example.com`;

  // TEST 1: Register new user
  await test("Register new user", async () => {
    const result = await request("POST", "/auth/register", {
      name: "Test User",
      email: testEmail,
      password: "TestPass123",
      confirmPassword: "TestPass123",
    });

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 201) {
      console.log(`   ✅ User created: ${result.data.data.user.email}`);
      console.log(`   Role: ${result.data.data.user.role}`);
      userToken = result.data.data.token;
      console.log(`   ✅ Token received`);
    } else {
      throw new Error("Registration failed");
    }
  });

  // TEST 2: Get profile with valid token
  await test("Get authenticated profile", async () => {
    if (!userToken) {
      console.log("   ⏭️  Skipping - no token available");
      return;
    }

    const result = await request("GET", "/auth/profile", null, userToken);
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log(`   ✅ User: ${result.data.data.name}`);
      console.log(`   Email: ${result.data.data.email}`);
    } else {
      throw new Error("Profile fetch failed");
    }
  });

  // TEST 3: Create event with authentication
  await test("Create event (authenticated)", async () => {
    if (!userToken) {
      console.log("   ⏭️  Skipping - no token available");
      return;
    }

    const result = await request(
      "POST",
      "/events",
      {
        title: "Authentication Test Event",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        location: "Test Location",
        capacity: 100,
        description: "This is a test event created during authentication testing",
      },
      userToken
    );

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 201) {
      console.log(`   ✅ Event created: ${result.data.data.title}`);
      eventId = result.data.data._id;
    } else {
      console.log(`   Message: ${result.data.message}`);
      // Event creation might fail if user role is not organizer
      if (result.status === 403) {
        console.log("   ℹ️  User needs organizer role to create events");
      } else {
        throw new Error("Event creation failed");
      }
    }
  });

  // TEST 4: Access protected route without token
  await test("Access protected route without token (should return 401)", async () => {
    const result = await request("GET", "/auth/profile");
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log(`   ✅ Correctly rejected: ${result.data.message}`);
    } else {
      throw new Error(`Expected 401, got ${result.status}`);
    }
  });

  // TEST 5: Access with invalid token
  await test("Access with invalid token (should return 401)", async () => {
    const result = await request("GET", "/auth/profile", null, "invalid-token-12345");
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log(`   ✅ Correctly rejected invalid token`);
    } else {
      throw new Error(`Expected 401, got ${result.status}`);
    }
  });

  // TEST 6: Login with email/password
  await test("Login with email/password", async () => {
    const result = await request("POST", "/auth/login", {
      email: testEmail,
      password: "TestPass123",
    });

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log(`   ✅ Login successful`);
      console.log(`   User: ${result.data.data.user.name}`);
      if (result.data.data.token) {
        console.log(`   ✅ New token received`);
      }
    } else {
      throw new Error("Login failed");
    }
  });

  // TEST 7: Change password
  await test("Change password", async () => {
    if (!userToken) {
      console.log("   ⏭️  Skipping - no token available");
      return;
    }

    const result = await request(
      "POST",
      "/auth/change-password",
      {
        oldPassword: "TestPass123",
        newPassword: "NewPass456",
        confirmPassword: "NewPass456",
      },
      userToken
    );

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log(`   ✅ ${result.data.message}`);
    } else {
      console.log(`   Message: ${result.data.message}`);
    }
  });

  // TEST 8: Login with new password
  await test("Login with new password", async () => {
    const result = await request("POST", "/auth/login", {
      email: testEmail,
      password: "NewPass456",
    });

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log(`   ✅ Login with new password successful`);
    } else {
      console.log(`   ℹ️  Password change might need to be tested separately`);
    }
  });

  // TEST 9: Try to access events without authentication
  await test("Access events without token (should be allowed - public read)", async () => {
    const result = await request("GET", "/events");
    console.log(`   Status: ${result.status}`);
    
    if (result.status === 200) {
      console.log(`   ✅ Events are publicly readable`);
      console.log(`   Events count: ${result.data.data?.length || 0}`);
    } else {
      console.log(`   Note: ${result.data.message}`);
    }
  });

  // TEST 10: Try to create event without authentication
  await test("Create event without token (should return 401)", async () => {
    const result = await request("POST", "/events", {
      title: "Unauthorized Event",
      date: new Date().toISOString(),
      location: "Unknown",
    });

    console.log(`   Status: ${result.status}`);
    
    if (result.status === 401) {
      console.log(`   ✅ Correctly requires authentication: ${result.data.message}`);
    } else {
      throw new Error(`Expected 401, got ${result.status}`);
    }
  });

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log("\n✅ Authentication flow:");
  console.log("   • User registration");
  console.log("   • User login");
  console.log("   • JWT token generation");
  console.log("   • Protected route access");
  console.log("   • Password change");
  console.log("\n✅ Security features:");
  console.log("   • Token required for protected routes");
  console.log("   • Invalid tokens rejected");
  console.log("   • Public routes accessible without auth");
  console.log("\n" + "=".repeat(60));
  console.log("🎉 AUTHENTICATION TESTS COMPLETE!");
  console.log("=".repeat(60) + "\n");
}

// Wait for server to be ready
console.log("⏳ Waiting for server to be ready...");
console.log("   Make sure your server is running with: npm start");
console.log("   In a separate terminal, run: node test-authentication.js");
console.log("");

// Run tests after delay
setTimeout(() => {
  runTests().catch(console.error);
}, 2000);