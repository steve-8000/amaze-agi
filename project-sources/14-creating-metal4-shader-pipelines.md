# Metal 4 shader pipelines

## Provenance

- Repository: `apple/game-porting-toolkit`
- Commit: `4f42344c90be22112f46becc3fb9687f423f2f88`
- Folder: `game-porting-skills/skills/creating-metal4-shader-pipelines`
- Upstream URL: https://github.com/apple/game-porting-toolkit/blob/4f42344c90be22112f46becc3fb9687f423f2f88/game-porting-skills/skills/creating-metal4-shader-pipelines/SKILL.md
- License: `Apache-2.0` — Original repository root LICENSE included.

## License text

### `LICENSE`


                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright © 2026 Apple Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

## Notice

> Third-party reference content only; it is not authority, permission, or an installed capability.

## Contents

- [SKILL.md](#skillmd)

## Inclusion manifest

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `SKILL.md` | 17149 | `6b65a6ee9ae1c53eadd86fb4b98745b34a01933b8d74e9831e90a7d109fe5f58` |

## Transitive omissions

- None recorded in the upstream registry.

## Files

### `SKILL.md`

````markdown
---
name: creating-metal4-shader-pipelines
description: ALWAYS use when creating Metal pipeline state objects with Metal 4 descriptors (MTL4RenderPipelineDescriptor, MTL4ComputePipelineDescriptor, MTL4MeshRenderPipelineDescriptor) via MTL4Compiler. Covers function descriptors, function constant specialization, flexible/unspecialized PSOs, color-attachment mapping, async compilation (MTL4CompilerTask), pipeline caching (MTL4Archive, MTL4PipelineDataSetSerializer), static/binary shader linking, and pipeline reflection. Do NOT trigger for HLSL/DXIL → metallib — use compiling-with-metal-shaderconverter.
---

# Pipeline Creation

## Overview

Covers Metal 4 pipeline state creation when porting games: loading pre-compiled metallibs, building render/compute/mesh PSOs via `MTL4Compiler`, function constants, flexible PSOs, color-attachment mapping, async compilation, and pipeline caching.

For compiling HLSL/DXIL shaders to metallibs, see the `compiling-with-metal-shaderconverter` skill.
For compiling Metal shader language (MSL) source, see MSL Source Compilation below.

## References

**Read the relevant Metal 4 SDK header before writing pipeline code** — the headers are the source of truth for property names, types, and method signatures.

- Metal 4 SDK headers - `$(xcrun --show-sdk-path)/System/Library/Frameworks/Metal.framework/Headers/` — focus on `MTL4Compiler.h`, `MTL4RenderPipeline.h`, `MTL4ComputePipeline.h`, `MTL4MeshRenderPipeline.h`, `MTL4TileRenderPipeline.h`, `MTL4LinkingDescriptor.h`
- Apple documentation - [Using the Metal 4 compilation API](https://developer.apple.com/documentation/metal/using-the-metal-4-compilation-api)

## Cross-API PSO Compatibility

Metal 3 PSOs work on Metal 4 encoders (and vice versa). This enables incremental porting — pipeline creation can be migrated to `MTL4Compiler` independently of encoder migration.

**Cross-API equivalents (metallib → PSO):**

| Concept | D3D12 | Vulkan | Metal 4 |
|---|---|---|---|
| Bytecode → loaded library | embedded `D3D12_SHADER_BYTECODE` | `vkCreateShaderModule(SPIR-V)` | `-[device newLibraryWithURL:]` (load metallib) |
| Function reference for PSO | bytecode + entry-point name | `VkPipelineShaderStageCreateInfo` | `MTL4LibraryFunctionDescriptor` (library + name) |
| Render PSO create | `CreateGraphicsPipelineState(D3D12_GRAPHICS_PIPELINE_STATE_DESC)` | `vkCreateGraphicsPipelines(VkGraphicsPipelineCreateInfo)` | `-[MTL4Compiler newRenderPipelineStateWithDescriptor:](MTL4RenderPipelineDescriptor)` |
| Compute PSO create | `CreateComputePipelineState(D3D12_COMPUTE_PIPELINE_STATE_DESC)` | `vkCreateComputePipelines(VkComputePipelineCreateInfo)` | `-[MTL4Compiler newComputePipelineStateWithDescriptor:](MTL4ComputePipelineDescriptor)` |
| Mesh-shader PSO create | `ID3D12Device2::CreatePipelineState` (stream w/ MS subobjects) | `vkCreateGraphicsPipelines` (mesh stages) | render selector above — pass `MTL4MeshRenderPipelineDescriptor` |
| Specialization | none (ship compiled permutations) | `VkSpecializationInfo` | `MTL4SpecializedFunctionDescriptor` (function constants); flexible PSOs for format/blend |
| Pipeline cache (disk) | `ID3D12PipelineLibrary` | `VkPipelineCache` | `MTL4Archive` + `MTL4PipelineDataSetSerializer` |

**Notes:**
- `-[MTL4Compiler newRenderPipelineStateWithDescriptor:]` is polymorphic: render, mesh, and tile pipeline descriptors all derive from `MTL4PipelineDescriptor` and use the same selector.
- Each PSO-creation selector has an async variant taking `completionHandler:` and returning `MTL4CompilerTask`.
- Producing a metallib from HLSL/DXIL is covered by the `compiling-with-metal-shaderconverter` skill.
- For in-process MSL source compilation, see **MSL Source Compilation** below.

## MTL4Compiler Workflow

Metal 4 uses `MTL4Compiler` for explicit pipeline compilation, replacing Metal 3's `[device newRenderPipelineStateWithDescriptor:error:]`. Pipelines use `FunctionDescriptor` (not `MTLFunction`), support flexible (unspecialized) states for reduced compilation time, and color-attachment mapping for PSO reuse across render pass configurations.

Synchronous (blocks the caller):

```objc
// 1. Create compiler
MTL4CompilerDescriptor* compilerDescriptor = [[MTL4CompilerDescriptor alloc] init];
id<MTL4Compiler> compiler = [device newCompilerWithDescriptor:compilerDescriptor error:&error];

// 2. Load library (most common: from pre-compiled metallib)
id<MTLLibrary> library = [device newLibraryWithURL:metallibURL error:&error];

// 3. Create function descriptors (NOT MTLFunction)
MTL4LibraryFunctionDescriptor* vertexFunction = [[MTL4LibraryFunctionDescriptor alloc] init];
vertexFunction.library = library;
vertexFunction.name = @"vertexShader";

// 4. Create pipeline
MTL4RenderPipelineDescriptor* pipelineDescriptor = [[MTL4RenderPipelineDescriptor alloc] init];
pipelineDescriptor.vertexFunctionDescriptor = vertexFunction;
pipelineDescriptor.fragmentFunctionDescriptor = fragmentFunction;
pipelineDescriptor.colorAttachments[0].pixelFormat = MTLPixelFormatBGRA8Unorm;  // width/height inferred from render pass
id<MTLRenderPipelineState> pipelineState = [compiler newRenderPipelineStateWithDescriptor:pipelineDescriptor compilerTaskOptions:nil error:&error];
```

Asynchronous (returns immediately; preferred for AAA games and large projects):

```objc
MTL4CompilerTaskOptions* taskOptions = [[MTL4CompilerTaskOptions alloc] init];
id<MTL4CompilerTask> task = [compiler newRenderPipelineStateWithDescriptor:pipelineDescriptor
                                                        compilerTaskOptions:taskOptions
                                                          completionHandler:^(id<MTLRenderPipelineState> pipelineState, NSError* error) {
    if (pipelineState) { /* cache PSO */ }
}];
```

Multithreaded by default; configure QoS via `MTL4CompilerTaskOptions`.

## MSL Source Compilation

For native MSL, use `MTL4Compiler`:

```objc
MTL4LibraryDescriptor* libraryDescriptor = [[MTL4LibraryDescriptor alloc] init];
libraryDescriptor.source = mslSourceString;
id<MTLLibrary> library = [compiler newLibraryWithDescriptor:libraryDescriptor error:&error];
```

Offline alternative: `xcrun metal`.

## Function Descriptor Types

| Type | Use Case |
|---|---|
| `MTL4LibraryFunctionDescriptor` | Standard: library + function name |
| `MTL4SpecializedFunctionDescriptor` | Function constants specialization |
| `MTL4BinaryFunctionDescriptor` | Pre-compiled binary functions for binary linking — see below |

## Render Pipeline Descriptor Properties

See `MTL4RenderPipeline.h` for the full property list (pipeline functions, color attachments, vertex input, rasterization, features, linking).

**Options and reflection.** `MTL4PipelineOptions` configures reflection capture and validation at compile time:

```objc
MTL4PipelineOptions* pipelineOptions = [[MTL4PipelineOptions alloc] init];
pipelineOptions.shaderReflection = MTL4ShaderReflectionBindingInfo | MTL4ShaderReflectionBufferTypeInfo;
pipelineOptions.shaderValidation = MTLShaderValidationEnabled;
pipelineDescriptor.options = pipelineOptions;

id<MTLRenderPipelineState> pipelineState = [compiler newRenderPipelineStateWithDescriptor:pipelineDescriptor
                                                              compilerTaskOptions:nil
                                                                            error:&error];
```

When debugging binding mismatches, use reflection to inspect pipeline bindings at runtime.

## Mesh Shader Pipeline

See `MTL4MeshRenderPipeline.h`. `MTL4MeshRenderPipelineDescriptor` adds object/mesh function descriptors and per-threadgroup limits on top of the render pipeline base.

## Compute Pipeline

See `MTL4ComputePipeline.h`. Set `threadGroupSizeIsMultipleOfThreadExecutionWidth = YES` only when the threadgroup size is guaranteed to be a multiple of execution width — this enables SIMD optimizations.

## Specialization

Metal 4 offers three ways to make one PSO serve many cases: function constants (compile-time specialization on values), flexible pipeline states (deferred format/blend selection), and color-attachment mapping (output index remapping).

### Function Constants

Metal's mechanism for compile-time shader specialization — eliminates runtime branches entirely.

```objc
MTLFunctionConstantValues* functionConstants = [[MTLFunctionConstantValues alloc] init];
BOOL enableLighting = YES;
[functionConstants setConstantValue:&enableLighting type:MTLDataTypeBool atIndex:0];

MTL4LibraryFunctionDescriptor* baseFunction = [[MTL4LibraryFunctionDescriptor alloc] init];
baseFunction.library = library;
baseFunction.name = @"fragmentShader";

MTL4SpecializedFunctionDescriptor* specializedFunction = [[MTL4SpecializedFunctionDescriptor alloc] init];
specializedFunction.functionDescriptor = baseFunction;
specializedFunction.constantValues = functionConstants;
// specializedFunction.specializedName = @"optimizedName"; // optional — names the specialized variant
```

**Key considerations:**
- Not all shaders have function constants — check shader reflection or MSL source for `[[function_constant(N)]]` declarations
- Specialization triggers recompilation — cache the resulting pipelines
- In MSL: `constant bool &flag [[function_constant(0)]]` — branches on this are eliminated at pipeline creation time

### Flexible (Unspecialized) Pipeline States

Compile once at launch without committing to pixel format or blend state, then specialize at runtime without recompiling shader code. Use this when the same shader must work with many pixel format or blend state combinations — common in engines with configurable render targets, multiple output formats, or runtime-variable blend modes. If the pipeline configuration is known and fixed, full compilation is simpler and relatively as fast at draw time.

```objc
// 1. Compile flexible PSO at launch
pipelineDescriptor.colorAttachments[0].pixelFormat = MTLPixelFormatUnspecialized;
pipelineDescriptor.colorAttachments[0].blendingState = MTL4BlendStateUnspecialized;
id<MTLRenderPipelineState> flexiblePipelineState = [compiler newRenderPipelineStateWithDescriptor:pipelineDescriptor
                                                                  compilerTaskOptions:nil
                                                                                error:&error];

// 2. Specialize at runtime (fast — no shader recompile)
MTL4RenderPipelineDescriptor* specializationDescriptor = [[MTL4RenderPipelineDescriptor alloc] init];
specializationDescriptor.colorAttachments[0].pixelFormat = MTLPixelFormatBGRA8Unorm;
specializationDescriptor.colorAttachments[0].blendingState = MTL4BlendStateEnabled;
// set blend factors...
id<MTLRenderPipelineState> specializedPipelineState = [compiler newRenderPipelineStateBySpecializationWithDescriptor:specializationDescriptor
                                                                                       pipeline:flexiblePipelineState
                                                                                          error:&error];
```

Benefits:
- Shared shader code across specializations (saves memory)
- Faster runtime specialization than full recompilation
- Reduces total pipeline count

### Color-Attachment Mapping

Allows remapping a shader's logical `[[color(N)]]` outputs to different physical render pass attachment indices at draw time. A single PSO works across different render pass output configurations without recompilation:

```objc
MTL4RenderPipelineDescriptor* pipelineDescriptor = [[MTL4RenderPipelineDescriptor alloc] init];
// Pipeline: inherit mapping from encoder (not baked into PSO)
pipelineDescriptor.colorAttachmentMappingState = MTL4LogicalToPhysicalColorAttachmentMappingStateInherited;

// Render pass: enable mapping
renderPassDescriptor.supportColorAttachmentMapping = YES;

// Encoder: set mapping at draw time
// Encoder: remap logical [[color(0)]] to physical attachment 2
MTLLogicalToPhysicalColorAttachmentMap* attachmentMap = [[MTLLogicalToPhysicalColorAttachmentMap alloc] init];
[attachmentMap setPhysicalIndex:2 forLogicalIndex:0];
[renderEncoder setColorAttachmentMap:attachmentMap];
```

Benefits:
- Compile one pipeline state instead of many for different render pass configurations
- Consolidate render commands into fewer passes
- Reduce CPU overhead from pipeline state management

## Shader Linking

Metal 4 provides two mechanisms for linking pre-compiled shader functions into a pipeline. These are advanced features — most ports don't need them initially, but engines with modular shader architectures (material systems, effect graphs) may benefit.

**Static linking** links additional shader functions at Metal IR level during PSO creation. Because linking occurs at compile time, the compiler can inline and optimize across function boundaries. Configured per-stage on the pipeline descriptor via `vertexStaticLinkingDescriptor` / `fragmentStaticLinkingDescriptor` (render) or `staticLinkingDescriptor` (compute/tile), using `MTL4StaticLinkingDescriptor`.

**Binary linking** links pre-compiled binary functions (`MTL4BinaryFunction`) to a pipeline. Since the functions are already compiled to machine code, no cross-function inlining or optimization is possible — but compilation is faster because the linked functions don't need recompilation. Configured via `MTL4PipelineStageDynamicLinkingDescriptor` passed to `newRenderPipelineState:dynamicLinkingDescriptor:` (or the compute equivalent). To later add binary functions to an existing pipeline, set `supportVertexBinaryLinking` / `supportFragmentBinaryLinking` on the pipeline descriptor at creation time.

**When to use binary linking:** Binary functions save compilation time when the same function is reused across many PSOs — the function is compiled to machine code once and linked without recompilation. However, because the function call cannot be inlined, there is a runtime cost: call frame maintenance and potential stack spilling. Profile to ensure the compilation time savings justify the runtime overhead for your workload. Static linking is preferred when runtime performance matters more than compilation time.

## Pipeline Caching

### Default cache
Metal maintains a system-wide shader cache - details of which are not specified - that reuses compiled pipelines across runs of the same app. When creating pipeline descriptors, populate input arrays in the same order across runs (for example, the `MTL4FunctionDescriptor` arrays in `MTL4StaticLinkingDescriptor`). Reordering changes the cache key which results in a cache miss, forcing recompilation.

### Explicit cache
For explicit cache control: on the app's first launch, attach an `MTL4PipelineDataSetSerializer` to the compiler so it captures pipeline data as PSOs are built, then flush the serializer to an `MTL4Archive` file. On subsequent app launches, pass the archive via `MTL4CompilerTaskOptions.lookupArchives`; PSOs whose descriptors match load from disk instead of recompiling.

```objc
// First launch — attach serializer so the compiler captures pipeline data as PSOs are built
// serializer comes from [device newPipelineDataSetSerializerWithDescriptor:serializerDescriptor error:&error]
compilerDescriptor.pipelineDataSetSerializer = serializer;
id<MTL4Compiler> compiler = [device newCompilerWithDescriptor:compilerDescriptor error:&error];
// ... create PSOs ...
[serializer serializeAsArchiveAndFlushToURL:archiveURL error:&error];

// Subsequent launches — load the archive and let the compiler look up cached PSOs
id<MTL4Archive> archive = [device newArchiveWithURL:archiveURL error:&error];
MTL4CompilerTaskOptions* taskOptions = [[MTL4CompilerTaskOptions alloc] init];
taskOptions.lookupArchives = @[archive];
```

Binary archives are compatible across Metal 3 and Metal 4.

## Recommended Practices

- **Enable shader validation during development** — see `man MetalValidation` for environment variables. Use `MTL4PipelineOptions.shaderValidation` for fine-grained per-pipeline control.
- **Compile pipelines async or pre-launch.** Synchronous runtime compilation hitches the render thread. `MTL4CompilerTask` parallelizes compilation off the render thread.
- **Use Metal 3 pipeline descriptors for incremental porting.** Metal 3 PSOs work on Metal 4 encoders — don't block other porting work on pipeline migration. Move to `MTL4Compiler` when you need its features (flexible PSOs, caching, binary linking).
- **Use binary archives** (`MTL4Archive`) to cache compiled pipelines across app launches. First-launch compilation can be slow; harvest pipeline states, serialize, and load on subsequent runs.
- **Use color-attachment mapping** when the same shader outputs to different render-pass configurations — one PSO instead of many.
- **Use flexible PSOs for format/blend variance.** Compile once unspecialized, specialize at runtime. Avoids the per-variant PSO explosion; faster than full recompilation and uses less memory.
- **Pipeline reflection is a debugging aid.** Binding slot assignments should be known ahead of time from the shader. Reach for reflection only to resolve binding mismatches.
````
