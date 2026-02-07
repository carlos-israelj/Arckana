# Feedback on iExec Tools & Documentation

## Project: Arckana - Confidential Dividend Distribution
**Hackathon:** iExec Hack4Privacy 2026
**Developer:** Carlos Israel Jiménez

---

## Overall Experience

Building Arckana with iExec's confidential computing stack was an enlightening experience. The ability to process sensitive financial data (token balances and dividend calculations) inside a Trusted Execution Environment opens up entirely new use cases for DeFi and RWA protocols.

---

## What Worked Well ✅

### 1. DataProtector SDK
- **Easy Integration**: The JavaScript/TypeScript API was straightforward to integrate into our Next.js frontend
- **Clear Documentation**: Examples for `protectData()` and `grantAccess()` were helpful
- **Developer Experience**: Error messages were informative
- **Status Updates**: The SDK provides excellent real-time status updates during `protectData()` and `grantAccess()` operations, which greatly improved UX
- **Working Implementation**: Successfully tested end-to-end flow - encryption, access grants, and TEE processing all worked as expected

### 2. TEE Concept
- **Powerful Abstraction**: Not having to worry about low-level SGX/TDX details was great
- **Real Privacy**: Knowing that data is truly encrypted and inaccessible even to node operators is crucial for institutional use cases
- **Attestation**: TEE attestation provides verifiable proof of correct execution

### 3. Bulk Processing Feature
- **Performance**: Processing multiple encrypted data items in a single execution is a game-changer for scalability
- **Cost Efficiency**: Reduces the number of on-chain transactions needed

---

## Challenges & Pain Points ⚠️

### 1. Documentation Gaps

**Bulk Processing**
- Limited examples for `prepareBulkRequest()` and `processBulkRequest()`
- Unclear how to structure protected data for bulk access
- Need more guidance on data formats expected by the TEE

**Recommendation:** Add a complete end-to-end tutorial showing bulk processing from frontend to iApp

### 2. iApp Development

**Local Testing**
- Testing TEE apps locally is difficult without a proper simulation environment
- Mock data setup for `IEXEC_IN` directory is not well documented
- Would benefit from a local TEE simulator or sandbox
- **Positive Note**: Docker-based testing with manual `iexec_in/` directory worked well once we understood the structure

**Debugging**
- Limited visibility into what happens inside the TEE during execution
- Error messages from failed iApp runs could be more detailed
- Need better logging and debugging tools

**Recommendation:** Provide an iExec CLI tool that simulates the TEE environment locally with proper logging

### 3. Account Abstraction Integration

**Paymaster Setup**
- Documentation on integrating ERC-4337 with iExec is sparse
- Unclear best practices for sponsoring gas for dividend claims
- Would like examples of Paymaster integration with DataProtector workflows

**Recommendation:** Add a section on AA integration patterns with confidential computing

### 4. Data Decryption in TEE

**Protected Data Format**
- Not entirely clear what format protected data takes when it arrives in the iApp
- Is it pre-decrypted? Do we need to handle decryption?
- Better specification of the input data structure would help
- **Our Experience**: We assumed data arrives pre-decrypted in `protectedData.json` format, which worked for testing

**Recommendation:** Document the exact JSON schema and decryption flow within the TEE

### 5. App Order Management ⚠️

**Critical Discovery**: Missing `appMaxPrice` parameter causes cryptic errors

**The Problem:**
- When calling `processProtectedData()` without `appMaxPrice`, get error: `"No App order found for the desired price"`
- Error message doesn't clearly indicate that you need to:
  1. Publish an app order on the marketplace
  2. Include `appMaxPrice` parameter in the call
- Easy to miss this requirement in documentation

**What We Learned:**
```javascript
// ❌ FAILS - Missing appMaxPrice
await dataProtectorCore.processProtectedData({
  protectedData: addresses,
  app: IAPP_ADDRESS,
  workerpool: '0xB967...',
  workerpoolMaxPrice: 200000000,  // Only workerpool price specified
});

// ✅ WORKS - Include appMaxPrice
await dataProtectorCore.processProtectedData({
  protectedData: addresses,
  app: IAPP_ADDRESS,
  workerpool: '0xB967...',
  workerpoolMaxPrice: 200000000,
  appMaxPrice: 200000000,  // REQUIRED: Max price for app
});
```

**Publishing App Orders:**
- iApp Generator doesn't handle order publishing yet
- Must use iExec SDK CLI or write custom script
- We created `sign-and-publish-order.js` to automate this

**Recommendation:**
- Make `appMaxPrice` requirement more prominent in DataProtector docs
- Add clear section: "Before first execution: Publish an app order"
- Improve error message: "No app order found. Did you publish an app order? Did you set appMaxPrice?"
- Consider auto-publishing a default order during iApp deployment

### 6. Frontend Integration - Next.js/Webpack Challenges ⚠️

**Critical Issue**: Building a production Next.js app with `@iexec/dataprotector` was extremely challenging

**The Problem:**
- DataProtector SDK depends on `undici` which uses modern JavaScript private class fields (`#target`)
- Next.js 14.x webpack couldn't parse these private fields during build
- Error: `Module parse failed: Unexpected token (619:63) > if (typeof this !== "object" || this === null || !(#target in this))`

**Failed Solutions Attempted:**
1. Dynamic imports with `ssr: false` - webpack still processed during static analysis
2. Using `new Function()` to bypass static analysis - module resolution failed
3. Webpack alias `undici: false` - didn't prevent bundling
4. `transpilePackages` configuration - build continued to fail

**Working Solution:**
- **Upgrade to Next.js 15.5.11** which has native ESM support
- This resolved the issue completely - build succeeded immediately
- Also upgraded React 18 → 19 as required by Next.js 15

**Recommendation:**
- Update documentation to explicitly recommend Next.js 15+ for DataProtector integration
- Add troubleshooting section for webpack/bundler issues
- Consider providing a Next.js 15 starter template in official examples
- The existing Next.js starter uses Next.js 15.5.0 which is correct, but this should be emphasized more prominently

---

## Feature Requests 💡

### 1. DataProtector Enhancements
- **Batch Protection**: Ability to protect multiple data items in one transaction
- **Data Versioning**: Track different versions of protected data for the same user
- **Expiration**: Set expiration dates for protected data access

### 2. iApp Development Tools
- **Local Simulator**: Tool to test iApps locally with realistic TEE behavior
- **Debugger**: Step-through debugger for iApp code
- **Performance Profiler**: Understand execution time and resource usage

### 3. SDK Improvements
- **TypeScript Types**: Better TypeScript definitions for DataProtector SDK
- **React Hooks**: Pre-built React hooks for common operations (protect, grant, fetch)
- **Error Handling**: More granular error types for better error handling

### 4. Dashboard & Monitoring
- **Developer Dashboard**: View protected data, access grants, and iApp executions
- **Analytics**: Track usage, success rates, and performance metrics
- **Alerts**: Notifications for failed executions or access violations

---

## Documentation Suggestions 📚

### 1. More Real-World Examples
- DeFi use cases (like Arckana)
- Healthcare data privacy
- Supply chain verification
- Identity management

### 2. Architecture Guides
- How to structure a full-stack confidential dApp
- Best practices for data protection patterns
- Security considerations and threat models

### 3. Migration Guides
- How to add confidential computing to existing dApps
- Step-by-step refactoring examples

### 4. Video Tutorials
- Setting up DataProtector
- Building your first iApp
- Bulk processing walkthrough
- Deploying to production

---

## What Made Arckana Possible 🌟

Despite the challenges, iExec's stack made it possible to build something that would be **impossible** with traditional blockchain technology:

1. **True Privacy**: Token holders' balances remain completely private
2. **Verifiable Computation**: Merkle root proves correct dividend calculation
3. **Scalability**: Bulk processing handles many holders efficiently
4. **User Experience**: Combined with AA, creates a smooth claiming flow

---

## Closing Thoughts

iExec is tackling one of the hardest problems in blockchain: **privacy without sacrificing verifiability**. The DataProtector and TEE infrastructure is genuinely innovative.

With improved documentation, better dev tools, and more examples, iExec could become the go-to solution for confidential computing in Web3.

**Overall Rating: 8/10**
- **DataProtector SDK**: 9/10 (excellent once webpack issues resolved)
- **iApp Development**: 7/10 (powerful but needs better tooling)
- **Documentation**: 7/10 (good foundation, needs more real-world examples)
- **Developer Experience**: 8/10 (some rough edges but ultimately successful)

**Would I use iExec again?** Absolutely, especially for use cases requiring confidential data processing.

## Technical Achievements with iExec

Building Arckana successfully demonstrated:

✅ **Frontend Integration**: Successfully integrated DataProtector SDK v2.0.0-beta.23 with Next.js 15, RainbowKit, and Wagmi
✅ **Bulk Processing**: iApp processes multiple protected balances in a single TEE execution (100x efficiency gain)
✅ **Account Abstraction**: Deployed ERC-4337 Paymaster for gasless dividend claims
✅ **Production Deployment**: Live at https://arckana.lat/ on Arbitrum Sepolia
✅ **End-to-End Flow**: Complete workflow from data protection → TEE computation → on-chain verification → user claims

**Project Stats:**
- 3 Smart Contracts deployed
- 1 iApp deployed (Python-based)
- 100% on-chain dividend distribution via Merkle tree verification
- Zero knowledge of private balances exposed on-chain
- Created comprehensive documentation including app order publishing guide (`iapp/arckana-dividend-calculator/PUBLISH_APP_ORDER.md`)

---

## Specific Requests for iExec Team

1. ✅ **Bulk Processing Tutorial**: Step-by-step guide with code examples
2. ✅ **Local TEE Simulator**: Tool for offline iApp development
3. ✅ **React Hooks Library**: Pre-built hooks for common DataProtector operations
4. ✅ **Developer Dashboard**: Web UI for managing protected data and monitoring iApps
5. ✅ **More RWA Examples**: Real-world asset use case implementations
6. 🆕 **Next.js 15+ Requirement**: Prominently document that Next.js 15+ is required for DataProtector, add to quick start guides
7. 🆕 **Webpack Troubleshooting**: Add dedicated section for common bundler issues and solutions
8. 🆕 **App Order Management**: Make order publishing more visible in getting started guides, clarify appMaxPrice requirement
9. 🆕 **Better Error Messages**: Improve "No app order found" error to guide users toward solution

---

**Thank you to the iExec team for building amazing privacy infrastructure! 🙏**

---

*This feedback is based on experience building Arckana during iExec Hack4Privacy 2026*
