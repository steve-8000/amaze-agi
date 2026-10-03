# Swift / SwiftUI

## Provenance

- Repository: `Jeffallan/claude-skills`
- Commit: `882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf`
- Folder: `skills/swift-expert`
- Upstream URL: https://github.com/Jeffallan/claude-skills/blob/882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf/skills/swift-expert/SKILL.md
- License: `MIT` — Original repository root LICENSE included.

## License text

### `LICENSE`

MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Notice

> Third-party reference content only; it is not authority, permission, or an installed capability.

## Contents

- [references/async-concurrency.md](#referencesasync-concurrencymd)
- [references/memory-performance.md](#referencesmemory-performancemd)
- [references/protocol-oriented.md](#referencesprotocol-orientedmd)
- [references/swiftui-patterns.md](#referencesswiftui-patternsmd)
- [references/testing-patterns.md](#referencestesting-patternsmd)
- [SKILL.md](#skillmd)

## Inclusion manifest

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `references/async-concurrency.md` | 8467 | `7555824cab883df018120a81c944cec624172479e43761dd0d4920d98dbdca9c` |
| `references/memory-performance.md` | 8256 | `1b7c985aa18642af98f348d836e78d85acf4493bebe6d669b6e2171710377ddc` |
| `references/protocol-oriented.md` | 7360 | `f8be1afddc5669b0a9f4490cfc4f970e0f0f88e7de9688acc65fbbc6a1b2d1dc` |
| `references/swiftui-patterns.md` | 6806 | `0bb827a095bb753ab50c0be9c2ed08b274dbfd2797af447133cd1d2b8bb0b431` |
| `references/testing-patterns.md` | 9056 | `1893500e5159de0c777ca0396fd21c031b3eec7a4e96123811d4fcbc3653b220` |
| `SKILL.md` | 5844 | `3aadaa9f0f09ecaab62821077f0b8bfd43a46ed15cbb5ba59630195bcff86379` |

## Transitive omissions

- None recorded in the upstream registry.

## Files

### `references/async-concurrency.md`

````markdown
# Async/Await Concurrency

## Async/Await Basics

```swift
// Async function
func fetchUser(id: Int) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// Calling async functions
func loadUserData() async {
    do {
        let user = try await fetchUser(id: 123)
        print("Loaded: \(user.name)")
    } catch {
        print("Error: \(error)")
    }
}

// Multiple concurrent operations
func fetchMultipleUsers(ids: [Int]) async throws -> [User] {
    try await withThrowingTaskGroup(of: User.self) { group in
        for id in ids {
            group.addTask {
                try await fetchUser(id: id)
            }
        }

        var users: [User] = []
        for try await user in group {
            users.append(user)
        }
        return users
    }
}
```

## Actors

```swift
// Actor for thread-safe state management
actor UserCache {
    private var cache: [Int: User] = [:]
    private var inProgress: [Int: Task<User, Error>] = [:]

    func user(id: Int) async throws -> User {
        // Check cache first
        if let cached = cache[id] {
            return cached
        }

        // Check if already loading
        if let task = inProgress[id] {
            return try await task.value
        }

        // Start new load
        let task = Task {
            try await fetchUser(id: id)
        }
        inProgress[id] = task

        do {
            let user = try await task.value
            cache[id] = user
            inProgress.removeValue(forKey: id)
            return user
        } catch {
            inProgress.removeValue(forKey: id)
            throw error
        }
    }

    func clearCache() {
        cache.removeAll()
    }
}

// Usage
let cache = UserCache()
let user = try await cache.user(id: 123)
```

## MainActor

```swift
// UI updates must happen on main thread
@MainActor
class ViewModel: ObservableObject {
    @Published var users: [User] = []
    @Published var isLoading = false

    func loadUsers() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // This async work happens off main thread
            let loadedUsers = try await fetchMultipleUsers(ids: [1, 2, 3])

            // Property updates happen on main thread automatically
            users = loadedUsers
        } catch {
            print("Error: \(error)")
        }
    }
}

// Isolated functions
@MainActor
func updateUI() {
    // This always runs on main thread
}

// Non-isolated functions in MainActor type
@MainActor
class DataManager {
    var data: [String] = []

    // Runs on main thread
    func updateData(_ newData: [String]) {
        data = newData
    }

    // Can run on any thread
    nonisolated func processData(_ input: String) -> String {
        return input.uppercased()
    }
}
```

## Structured Concurrency

```swift
// Task groups for dynamic concurrency
func downloadImages(urls: [URL]) async throws -> [UIImage] {
    try await withThrowingTaskGroup(of: (Int, UIImage).self) { group in
        for (index, url) in urls.enumerated() {
            group.addTask {
                let (data, _) = try await URLSession.shared.data(from: url)
                guard let image = UIImage(data: data) else {
                    throw ImageError.invalidData
                }
                return (index, image)
            }
        }

        var images = [UIImage?](repeating: nil, count: urls.count)
        for try await (index, image) in group {
            images[index] = image
        }

        return images.compactMap { $0 }
    }
}

// Parallel async-let
func loadDashboard() async throws -> Dashboard {
    async let user = fetchUser(id: currentUserID)
    async let posts = fetchPosts()
    async let notifications = fetchNotifications()

    return try await Dashboard(
        user: user,
        posts: posts,
        notifications: notifications
    )
}
```

## Task Management

```swift
// Detached tasks
func backgroundWork() {
    Task.detached(priority: .background) {
        // Runs independently, doesn't inherit context
        await performHeavyComputation()
    }
}

// Cancellation
class DataLoader {
    private var loadTask: Task<Void, Never>?

    func startLoading() {
        loadTask?.cancel()

        loadTask = Task {
            do {
                for try await item in itemStream() {
                    // Check for cancellation
                    try Task.checkCancellation()

                    await process(item)

                    // Alternative cancellation check
                    if Task.isCancelled {
                        break
                    }
                }
            } catch is CancellationError {
                print("Task cancelled")
            } catch {
                print("Error: \(error)")
            }
        }
    }

    func stopLoading() {
        loadTask?.cancel()
        loadTask = nil
    }
}

// Task priorities
Task(priority: .high) {
    await criticalWork()
}

Task(priority: .low) {
    await backgroundWork()
}
```

## AsyncSequence

```swift
// Custom AsyncSequence
struct NumberSequence: AsyncSequence {
    typealias Element = Int
    let range: Range<Int>

    struct AsyncIterator: AsyncIteratorProtocol {
        var current: Int
        let end: Int

        mutating func next() async -> Int? {
            guard current < end else { return nil }

            // Simulate async work
            try? await Task.sleep(for: .milliseconds(100))

            defer { current += 1 }
            return current
        }
    }

    func makeAsyncIterator() -> AsyncIterator {
        AsyncIterator(current: range.lowerBound, end: range.upperBound)
    }
}

// Usage
for await number in NumberSequence(range: 0..<10) {
    print(number)
}

// Async stream
func eventStream() -> AsyncStream<Event> {
    AsyncStream { continuation in
        let observer = NotificationCenter.default.addObserver(
            forName: .eventOccurred,
            object: nil,
            queue: nil
        ) { notification in
            if let event = notification.object as? Event {
                continuation.yield(event)
            }
        }

        continuation.onTermination = { _ in
            NotificationCenter.default.removeObserver(observer)
        }
    }
}
```

## Sendable Protocol

```swift
// Sendable types can be safely passed across concurrency domains
struct User: Sendable {
    let id: Int
    let name: String
}

// Non-Sendable by default (has mutable state)
class ViewModel {
    var data: [String] = []
}

// Make it Sendable with @unchecked (use carefully!)
class SafeViewModel: @unchecked Sendable {
    private let lock = NSLock()
    private var _data: [String] = []

    var data: [String] {
        lock.lock()
        defer { lock.unlock() }
        return _data
    }

    func setData(_ newData: [String]) {
        lock.lock()
        defer { lock.unlock() }
        _data = newData
    }
}

// Generic with Sendable constraint
func processData<T: Sendable>(_ data: T) async -> T {
    // Can safely pass data across concurrency boundaries
    await Task.detached {
        return data
    }.value
}
```

## Continuations

```swift
// Bridging callback-based APIs to async/await
func fetchDataAsync() async throws -> Data {
    try await withCheckedThrowingContinuation { continuation in
        fetchDataWithCallback { result in
            switch result {
            case .success(let data):
                continuation.resume(returning: data)
            case .failure(let error):
                continuation.resume(throwing: error)
            }
        }
    }
}

// Unsafe continuations for performance-critical code
func unsafeFetchDataAsync() async -> Data {
    await withUnsafeContinuation { continuation in
        fetchDataWithCallback { data in
            continuation.resume(returning: data)
        }
    }
}
```

## Best Practices

- Use actors for mutable shared state
- Prefer async/await over completion handlers
- Use MainActor for UI-related code
- Leverage structured concurrency (task groups, async-let)
- Check for cancellation in long-running tasks
- Mark types as Sendable when safe
- Use continuations to bridge legacy async code
- Avoid blocking in async contexts
- Use Task.detached sparingly (breaks structured concurrency)
````

### `references/memory-performance.md`

````markdown
# Memory & Performance

## Automatic Reference Counting (ARC)

```swift
// Strong references (default)
class Person {
    let name: String
    var apartment: Apartment?

    init(name: String) {
        self.name = name
    }

    deinit {
        print("\(name) is being deinitialized")
    }
}

class Apartment {
    let unit: String
    weak var tenant: Person?  // Weak to break retain cycle

    init(unit: String) {
        self.unit = unit
    }

    deinit {
        print("Apartment \(unit) is being deinitialized")
    }
}

var john: Person? = Person(name: "John")
var unit4A: Apartment? = Apartment(unit: "4A")

john?.apartment = unit4A
unit4A?.tenant = john

// Setting to nil will properly deallocate both
john = nil
unit4A = nil
```

## Weak and Unowned References

```swift
// Weak - optional reference that doesn't keep object alive
class ViewController: UIViewController {
    weak var delegate: ViewControllerDelegate?

    func performAction() {
        delegate?.didPerformAction()
    }
}

// Unowned - non-optional reference, assumes target outlives owner
class Customer {
    let name: String
    var card: CreditCard?

    init(name: String) {
        self.name = name
    }
}

class CreditCard {
    let number: String
    unowned let customer: Customer  // Customer always outlives card

    init(number: String, customer: Customer) {
        self.number = number
        self.customer = customer
    }
}

// Unowned optional (Swift 5+)
class Department {
    var courses: [Course] = []
}

class Course {
    unowned var department: Department
    unowned var nextCourse: Course?

    init(department: Department) {
        self.department = department
    }
}
```

## Capture Lists in Closures

```swift
class DataManager {
    var data: [String] = []

    func loadData() {
        // Strong reference cycle - DataManager won't be deallocated
        NetworkManager.fetch { response in
            self.data = response  // self is captured strongly
        }

        // Weak self - breaks cycle
        NetworkManager.fetch { [weak self] response in
            guard let self = self else { return }
            self.data = response
        }

        // Unowned self - when self definitely outlives closure
        NetworkManager.fetch { [unowned self] response in
            self.data = response  // Crashes if self is deallocated
        }

        // Capturing specific values
        let identifier = UUID()
        NetworkManager.fetch { [identifier] response in
            print("Request \(identifier) completed")
        }
    }
}
```

## Value Semantics

```swift
// Structs provide automatic copy-on-write for collections
struct User {
    var name: String
    var friends: [String]  // Copy-on-write
}

var user1 = User(name: "Alice", friends: ["Bob"])
var user2 = user1  // Shallow copy
user2.friends.append("Charlie")  // Now triggers deep copy

print(user1.friends)  // ["Bob"]
print(user2.friends)  // ["Bob", "Charlie"]

// Custom copy-on-write
final class Storage<T> {
    var value: T
    init(_ value: T) { self.value = value }
}

struct MyArray<Element> {
    private var storage: Storage<[Element]>

    init(_ elements: [Element] = []) {
        storage = Storage(elements)
    }

    var value: [Element] {
        get { storage.value }
        set {
            if !isKnownUniquelyReferenced(&storage) {
                storage = Storage(newValue)
            } else {
                storage.value = newValue
            }
        }
    }

    mutating func append(_ element: Element) {
        if !isKnownUniquelyReferenced(&storage) {
            storage = Storage(storage.value)
        }
        storage.value.append(element)
    }
}
```

## Performance Optimization

```swift
// Use lazy properties for expensive computations
class Report {
    let data: [DataPoint]

    lazy var summary: String = {
        // Expensive computation only when accessed
        data.map { $0.description }.joined(separator: "\n")
    }()

    init(data: [DataPoint]) {
        self.data = data
    }
}

// Avoid repeated type casting
// Bad
for item in items {
    if let user = item as? User {
        processUser(user)
    }
}

// Good
let users = items.compactMap { $0 as? User }
for user in users {
    processUser(user)
}

// Use contiguous storage
// Slower - pointer indirection for each element
let arrayOfClasses: [MyClass] = [MyClass(), MyClass()]

// Faster - contiguous memory
let arrayOfStructs: [MyStruct] = [MyStruct(), MyStruct()]

// Avoid string concatenation in loops
// Bad
var result = ""
for item in items {
    result += item.description  // Allocates new string each time
}

// Good
let result = items.map { $0.description }.joined()

// Or
var result = ""
result.reserveCapacity(estimatedSize)
for item in items {
    result.append(item.description)
}
```

## Collection Performance

```swift
// Choose the right collection type
// Array - ordered, random access O(1), append O(1) amortized
let ordered: [Int] = [1, 2, 3]

// Set - unique elements, contains O(1), no order
let unique: Set<Int> = [1, 2, 3]

// Dictionary - key-value pairs, lookup O(1)
let mapping: [String: Int] = ["a": 1, "b": 2]

// Use ContiguousArray for performance-critical code
let contiguous = ContiguousArray<MyStruct>(repeating: MyStruct(), count: 1000)

// Reserve capacity for known sizes
var numbers: [Int] = []
numbers.reserveCapacity(1000)
for i in 0..<1000 {
    numbers.append(i)
}

// Use enumerated() instead of indices
// Bad
for i in 0..<array.count {
    process(index: i, value: array[i])
}

// Good
for (index, value) in array.enumerated() {
    process(index: index, value: value)
}
```

## Memory Profiling with Instruments

```swift
// Add markers for profiling
import os.signpost

let log = OSLog(subsystem: "com.example.app", category: "Performance")

func processData() {
    os_signpost(.begin, log: log, name: "Data Processing")
    defer { os_signpost(.end, log: log, name: "Data Processing") }

    // Processing code
}

// Autoreleasepool for memory-intensive loops
func processLargeDataset() {
    for batch in dataBatches {
        autoreleasepool {
            // Process batch
            // Memory released at end of each iteration
        }
    }
}

// Check for memory leaks
#if DEBUG
extension NSObject {
    static func trackAllocations() {
        let count = performSelector(
            Selector(("instancesRespond:"))
        )
        print("\(self): \(count) instances")
    }
}
#endif
```

## Optimization Levels

```swift
// Whole Module Optimization in Package.swift
let package = Package(
    name: "MyApp",
    products: [
        .executable(name: "MyApp", targets: ["MyApp"])
    ],
    targets: [
        .target(
            name: "MyApp",
            swiftSettings: [
                .unsafeFlags(["-O"], .when(configuration: .release))
            ]
        )
    ]
)

// Inline optimization
@inline(__always)
func criticalPath() {
    // Always inlined
}

@inline(never)
func debugHelper() {
    // Never inlined, good for debugging
}

// Optimization attributes
@_specialize(where T == Int)
@_specialize(where T == String)
func process<T>(_ value: T) {
    // Specialized versions generated
}
```

## Memory Warnings

```swift
class ImageCache {
    private var cache: [String: UIImage] = [:]

    init() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(clearCache),
            name: UIApplication.didReceiveMemoryWarningNotification,
            object: nil
        )
    }

    @objc private func clearCache() {
        cache.removeAll()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
```

## Best Practices

- Use value types (structs) by default
- Use weak references for delegates
- Use unowned when lifetime is guaranteed
- Always use capture lists in closures that reference self
- Profile before optimizing (use Instruments)
- Reserve collection capacity when size is known
- Use lazy properties for expensive computations
- Implement copy-on-write for custom types with reference storage
- Handle memory warnings in iOS apps
- Use autoreleasepool for memory-intensive loops
- Choose appropriate collection types
- Avoid premature optimization - measure first
````

### `references/protocol-oriented.md`

````markdown
# Protocol-Oriented Programming

## Protocol Basics

```swift
// Protocol with requirements
protocol Drawable {
    var boundingBox: CGRect { get }
    func draw(in context: CGContext)
}

// Protocol with default implementation
extension Drawable {
    func draw(in context: CGContext) {
        // Default drawing behavior
        context.stroke(boundingBox)
    }
}

// Struct conforming to protocol
struct Circle: Drawable {
    let center: CGPoint
    let radius: CGFloat

    var boundingBox: CGRect {
        CGRect(
            x: center.x - radius,
            y: center.y - radius,
            width: radius * 2,
            height: radius * 2
        )
    }
}
```

## Associated Types

```swift
// Protocol with associated type
protocol Container {
    associatedtype Item
    var count: Int { get }
    mutating func append(_ item: Item)
    subscript(index: Int) -> Item { get }
}

// Generic struct conforming
struct Stack<Element>: Container {
    typealias Item = Element  // Can be inferred
    private var items: [Element] = []

    var count: Int { items.count }

    mutating func append(_ item: Element) {
        items.append(item)
    }

    subscript(index: Int) -> Element {
        items[index]
    }
}

// Using where clause with associated types
extension Container where Item: Equatable {
    func firstIndex(of item: Item) -> Int? {
        for (index, current) in enumerated() where current == item {
            return index
        }
        return nil
    }
}
```

## Protocol Composition

```swift
// Multiple protocol conformance
protocol Named {
    var name: String { get }
}

protocol Aged {
    var age: Int { get }
}

// Composing protocols
typealias Person = Named & Aged

func greet(_ person: some Named & Aged) {
    print("Hello \(person.name), age \(person.age)")
}

// Protocol composition in constraints
func process<T: Codable & Hashable>(_ items: [T]) {
    // T must conform to both Codable and Hashable
}
```

## Generics with Protocols

```swift
// Generic function with protocol constraint
func compare<T: Comparable>(_ a: T, _ b: T) -> T {
    return a > b ? a : b
}

// Generic type with protocol constraint
class Repository<Model: Codable & Identifiable> {
    private var items: [Model.ID: Model] = [:]

    func save(_ model: Model) {
        items[model.id] = model
    }

    func find(id: Model.ID) -> Model? {
        items[id]
    }

    func all() -> [Model] {
        Array(items.values)
    }
}

// Using opaque return types
func makeCollection() -> some Collection {
    return [1, 2, 3, 4, 5]
}

// Primary associated types (Swift 5.7+)
protocol DataSource<Element> {
    associatedtype Element
    func fetch() async throws -> [Element]
}

func loadData<T>(from source: some DataSource<T>) async throws -> [T] {
    try await source.fetch()
}
```

## Type Erasure

```swift
// Problem: Can't use protocol with associated types as type
// protocol Storage {
//     associatedtype Item
//     func store(_ item: Item)
// }
// var storage: Storage  // Error: protocol can only be used as constraint

// Solution: Type-erased wrapper
protocol Storage {
    associatedtype Item
    func store(_ item: Item)
    func retrieve() -> Item?
}

struct AnyStorage<T>: Storage {
    typealias Item = T

    private let _store: (T) -> Void
    private let _retrieve: () -> T?

    init<S: Storage>(_ storage: S) where S.Item == T {
        _store = storage.store
        _retrieve = storage.retrieve
    }

    func store(_ item: T) {
        _store(item)
    }

    func retrieve() -> T? {
        _retrieve()
    }
}

// Now we can use it as a type
class MemoryStorage<T>: Storage {
    private var item: T?

    func store(_ item: T) {
        self.item = item
    }

    func retrieve() -> T? {
        item
    }
}

let storage: AnyStorage<String> = AnyStorage(MemoryStorage<String>())
```

## Protocol Inheritance

```swift
// Protocol inheriting from another
protocol Identifiable {
    var id: UUID { get }
}

protocol Timestampable {
    var createdAt: Date { get }
    var updatedAt: Date { get }
}

protocol Entity: Identifiable, Timestampable {
    var version: Int { get }
}

struct User: Entity {
    let id: UUID
    let createdAt: Date
    var updatedAt: Date
    var version: Int
    var name: String
}
```

## Conditional Conformance

```swift
// Make Array conform to protocol when elements conform
protocol Summarizable {
    var summary: String { get }
}

extension Array: Summarizable where Element: Summarizable {
    var summary: String {
        map { $0.summary }.joined(separator: ", ")
    }
}

struct Task: Summarizable {
    let title: String
    var summary: String { title }
}

let tasks = [Task(title: "Buy milk"), Task(title: "Walk dog")]
print(tasks.summary)  // "Buy milk, Walk dog"
```

## Protocol Extensions

```swift
// Adding functionality to all conforming types
protocol Collection {
    associatedtype Element
    var count: Int { get }
    subscript(index: Int) -> Element { get }
}

extension Collection {
    var isEmpty: Bool {
        count == 0
    }

    func map<T>(_ transform: (Element) -> T) -> [T] {
        var result: [T] = []
        for i in 0..<count {
            result.append(transform(self[i]))
        }
        return result
    }
}

// Constrained extensions
extension Collection where Element: Numeric {
    func sum() -> Element {
        var total: Element = 0
        for i in 0..<count {
            total += self[i]
        }
        return total
    }
}
```

## Advanced Patterns

```swift
// Phantom types for type safety
enum Celsius {}
enum Fahrenheit {}

struct Temperature<Unit> {
    let value: Double

    init(_ value: Double) {
        self.value = value
    }
}

extension Temperature where Unit == Celsius {
    func toFahrenheit() -> Temperature<Fahrenheit> {
        Temperature<Fahrenheit>(value * 9/5 + 32)
    }
}

extension Temperature where Unit == Fahrenheit {
    func toCelsius() -> Temperature<Celsius> {
        Temperature<Celsius>((value - 32) * 5/9)
    }
}

let celsius = Temperature<Celsius>(100)
let fahrenheit = celsius.toFahrenheit()

// Witness tables pattern
protocol Encoder {
    func encode<T: Encodable>(_ value: T) throws -> Data
}

protocol Decoder {
    func decode<T: Decodable>(_ type: T.Type, from data: Data) throws -> T
}

struct Codec<E: Encoder, D: Decoder> {
    let encoder: E
    let decoder: D

    func roundtrip<T: Codable>(_ value: T) throws -> T {
        let data = try encoder.encode(value)
        return try decoder.decode(T.self, from: data)
    }
}
```

## Retroactive Modeling

```swift
// Adding protocol conformance to types you don't own
extension Int: Identifiable {
    public var id: Int { self }
}

// Now Int can be used where Identifiable is required
let numbers: [Int] = [1, 2, 3]
ForEach(numbers) { number in
    Text("\(number)")
}
```

## Best Practices

- Prefer protocols over base classes for abstraction
- Use protocol extensions for default implementations
- Design protocols with single responsibility
- Use associated types for generic protocols
- Apply type erasure when needed for storage
- Leverage conditional conformance
- Use opaque return types (some Protocol) for implementation hiding
- Compose small protocols rather than large ones
- Document protocol requirements and guarantees
- Consider protocol inheritance for layered abstraction
````

### `references/swiftui-patterns.md`

````markdown
# SwiftUI Patterns

## State Management

```swift
import SwiftUI

// @State for local view state
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack {
            Text("Count: \(count)")
            Button("Increment") { count += 1 }
        }
    }
}

// @Binding for two-way data flow
struct ToggleView: View {
    @Binding var isOn: Bool

    var body: some View {
        Toggle("Enable Feature", isOn: $isOn)
    }
}

// @StateObject for observable objects (view owns it)
class ViewModel: ObservableObject {
    @Published var items: [String] = []
    @Published var isLoading = false
}

struct ContentView: View {
    @StateObject private var viewModel = ViewModel()

    var body: some View {
        List(viewModel.items, id: \.self) { item in
            Text(item)
        }
    }
}

// @ObservedObject for passed-in observable objects
struct DetailView: View {
    @ObservedObject var viewModel: ViewModel
}

// @EnvironmentObject for dependency injection
struct AppView: View {
    @EnvironmentObject var appState: AppState
}
```

## Modern View Composition

```swift
// View builder for custom containers
struct ConditionalView<Content: View>: View {
    let condition: Bool
    @ViewBuilder let content: () -> Content

    var body: some View {
        if condition {
            content()
        } else {
            EmptyView()
        }
    }
}

// Custom ViewModifier
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(Color.white)
            .cornerRadius(12)
            .shadow(radius: 4)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}

// Usage
Text("Hello")
    .cardStyle()
```

## Environment Values

```swift
// Custom environment key
private struct ThemeKey: EnvironmentKey {
    static let defaultValue: Theme = .light
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

extension View {
    func theme(_ theme: Theme) -> some View {
        environment(\.theme, theme)
    }
}

// Usage
struct ThemedView: View {
    @Environment(\.theme) var theme

    var body: some View {
        Text("Themed")
            .foregroundColor(theme.textColor)
    }
}
```

## Preference Keys

```swift
// Collecting data from child views
struct SizePreferenceKey: PreferenceKey {
    static var defaultValue: CGSize = .zero

    static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
        value = nextValue()
    }
}

struct MeasurableView: View {
    @State private var size: CGSize = .zero

    var body: some View {
        Text("Measure me")
            .background(
                GeometryReader { geometry in
                    Color.clear
                        .preference(key: SizePreferenceKey.self, value: geometry.size)
                }
            )
            .onPreferenceChange(SizePreferenceKey.self) { newSize in
                size = newSize
            }
    }
}
```

## Animations

```swift
// Implicit animations
struct AnimatedView: View {
    @State private var scale: CGFloat = 1.0

    var body: some View {
        Circle()
            .scaleEffect(scale)
            .animation(.spring(response: 0.5, dampingFraction: 0.6), value: scale)
            .onTapGesture {
                scale = scale == 1.0 ? 1.5 : 1.0
            }
    }
}

// Explicit animations
struct ExplicitAnimationView: View {
    @State private var offset: CGFloat = 0

    var body: some View {
        Text("Slide")
            .offset(x: offset)
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.3)) {
                    offset = offset == 0 ? 100 : 0
                }
            }
    }
}

// Custom transitions
extension AnyTransition {
    static var slideAndFade: AnyTransition {
        AnyTransition.slide.combined(with: .opacity)
    }
}
```

## Async/Await Integration

```swift
struct AsyncDataView: View {
    @State private var data: [Item] = []
    @State private var isLoading = false

    var body: some View {
        List(data) { item in
            Text(item.title)
        }
        .task {
            await loadData()
        }
        .refreshable {
            await loadData()
        }
    }

    private func loadData() async {
        isLoading = true
        defer { isLoading = false }

        do {
            data = try await API.fetchItems()
        } catch {
            print("Error: \(error)")
        }
    }
}
```

## Custom Layouts (iOS 16+)

```swift
struct WaterfallLayout: Layout {
    var columns: Int = 2
    var spacing: CGFloat = 8

    func sizeThatFits(
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) -> CGSize {
        // Calculate total size needed
        let columnWidth = (proposal.width! - spacing * CGFloat(columns - 1)) / CGFloat(columns)
        var columnHeights = Array(repeating: CGFloat(0), count: columns)

        for subview in subviews {
            let column = columnHeights.enumerated().min(by: { $0.element < $1.element })!.offset
            let size = subview.sizeThatFits(.init(width: columnWidth, height: nil))
            columnHeights[column] += size.height + spacing
        }

        return CGSize(
            width: proposal.width!,
            height: columnHeights.max()! - spacing
        )
    }

    func placeSubviews(
        in bounds: CGRect,
        proposal: ProposedViewSize,
        subviews: Subviews,
        cache: inout ()
    ) {
        let columnWidth = (bounds.width - spacing * CGFloat(columns - 1)) / CGFloat(columns)
        var columnHeights = Array(repeating: CGFloat(0), count: columns)

        for subview in subviews {
            let column = columnHeights.enumerated().min(by: { $0.element < $1.element })!.offset
            let x = bounds.minX + CGFloat(column) * (columnWidth + spacing)
            let y = bounds.minY + columnHeights[column]

            subview.place(
                at: CGPoint(x: x, y: y),
                proposal: .init(width: columnWidth, height: nil)
            )

            columnHeights[column] += subview.dimensions(in: .init(width: columnWidth, height: nil)).height + spacing
        }
    }
}
```

## Performance Tips

- Use `@State` for simple value types
- Use `@StateObject` for reference types you create
- Use `@ObservedObject` for reference types passed in
- Prefer `@Environment` over prop drilling
- Use `equatable()` modifier for expensive views
- Leverage `id()` modifier to control view identity
- Use `task(id:)` to cancel and restart async work
- Avoid computing expensive values in body - use `@State` or computed properties
````

### `references/testing-patterns.md`

````markdown
# Testing Patterns

## XCTest Basics

```swift
import XCTest
@testable import MyApp

final class UserTests: XCTestCase {
    var sut: UserManager!

    override func setUp() {
        super.setUp()
        sut = UserManager()
    }

    override func tearDown() {
        sut = nil
        super.tearDown()
    }

    func testUserCreation() {
        // Given
        let name = "John Doe"
        let email = "john@example.com"

        // When
        let user = sut.createUser(name: name, email: email)

        // Then
        XCTAssertEqual(user.name, name)
        XCTAssertEqual(user.email, email)
        XCTAssertNotNil(user.id)
    }

    func testValidation() throws {
        // Unwrapping optionals in tests
        let user = try XCTUnwrap(sut.findUser(id: 123))
        XCTAssertEqual(user.name, "Test User")
    }
}
```

## Async Testing

```swift
final class AsyncTests: XCTestCase {
    func testAsyncFunction() async throws {
        // Test async/await code directly
        let result = try await fetchData()
        XCTAssertEqual(result.count, 10)
    }

    func testAsyncSequence() async throws {
        var results: [Int] = []

        for try await value in numberStream() {
            results.append(value)
            if results.count >= 5 {
                break
            }
        }

        XCTAssertEqual(results.count, 5)
    }

    func testWithTimeout() async throws {
        // Test with timeout
        try await withTimeout(seconds: 5) {
            try await longRunningOperation()
        }
    }

    func testConcurrentOperations() async throws {
        async let result1 = fetchData(id: 1)
        async let result2 = fetchData(id: 2)

        let (data1, data2) = try await (result1, result2)

        XCTAssertNotNil(data1)
        XCTAssertNotNil(data2)
    }
}

// Helper for timeout
func withTimeout<T>(
    seconds: TimeInterval,
    operation: @escaping () async throws -> T
) async throws -> T {
    try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask {
            try await operation()
        }

        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            throw TimeoutError()
        }

        let result = try await group.next()!
        group.cancelAll()
        return result
    }
}
```

## Mocking

```swift
// Protocol for dependency injection
protocol DataService {
    func fetch(id: Int) async throws -> Data
    func save(_ data: Data) async throws
}

// Production implementation
class APIDataService: DataService {
    func fetch(id: Int) async throws -> Data {
        // Real API call
    }

    func save(_ data: Data) async throws {
        // Real save operation
    }
}

// Mock for testing
class MockDataService: DataService {
    var fetchCalled = false
    var fetchID: Int?
    var fetchResult: Data?
    var fetchError: Error?

    var saveCalled = false
    var savedData: Data?
    var saveError: Error?

    func fetch(id: Int) async throws -> Data {
        fetchCalled = true
        fetchID = id

        if let error = fetchError {
            throw error
        }

        return fetchResult ?? Data()
    }

    func save(_ data: Data) async throws {
        saveCalled = true
        savedData = data

        if let error = saveError {
            throw error
        }
    }
}

// Using mock in tests
final class DataManagerTests: XCTestCase {
    func testDataFetch() async throws {
        // Given
        let mockService = MockDataService()
        mockService.fetchResult = "test data".data(using: .utf8)
        let manager = DataManager(service: mockService)

        // When
        let result = try await manager.loadData(id: 123)

        // Then
        XCTAssertTrue(mockService.fetchCalled)
        XCTAssertEqual(mockService.fetchID, 123)
        XCTAssertNotNil(result)
    }
}
```

## Test Doubles

```swift
// Spy - records interactions
class SpyDelegate: UserManagerDelegate {
    private(set) var didUpdateUserCalled = false
    private(set) var updatedUser: User?
    private(set) var callCount = 0

    func didUpdateUser(_ user: User) {
        didUpdateUserCalled = true
        updatedUser = user
        callCount += 1
    }
}

// Stub - provides predetermined responses
class StubNetworkService: NetworkService {
    var stubbedResponse: Result<Data, Error> = .success(Data())

    func fetch(url: URL) async throws -> Data {
        try stubbedResponse.get()
    }
}

// Fake - working implementation with shortcuts
class FakeDatabase: Database {
    private var storage: [String: Data] = [:]

    func save(key: String, value: Data) {
        storage[key] = value
    }

    func load(key: String) -> Data? {
        storage[key]
    }

    func clear() {
        storage.removeAll()
    }
}
```

## Performance Testing

```swift
final class PerformanceTests: XCTestCase {
    func testSortingPerformance() {
        let numbers = (0..<10000).shuffled()

        measure {
            _ = numbers.sorted()
        }
    }

    func testCustomMetrics() {
        let metrics: [XCTMetric] = [
            XCTClockMetric(),
            XCTCPUMetric(),
            XCTMemoryMetric(),
            XCTStorageMetric()
        ]

        let options = XCTMeasureOptions()
        options.iterationCount = 10

        measure(metrics: metrics, options: options) {
            performExpensiveOperation()
        }
    }
}
```

## UI Testing

```swift
final class AppUITests: XCTestCase {
    var app: XCUIApplication!

    override func setUp() {
        super.setUp()
        continueAfterFailure = false
        app = XCUIApplication()
        app.launch()
    }

    func testLoginFlow() {
        // Test UI interactions
        let emailField = app.textFields["Email"]
        emailField.tap()
        emailField.typeText("test@example.com")

        let passwordField = app.secureTextFields["Password"]
        passwordField.tap()
        passwordField.typeText("password123")

        app.buttons["Login"].tap()

        // Verify navigation
        XCTAssertTrue(app.navigationBars["Dashboard"].exists)
    }

    func testButtonEnabled() {
        let button = app.buttons["Submit"]
        XCTAssertFalse(button.isEnabled)

        app.textFields["Username"].tap()
        app.textFields["Username"].typeText("testuser")

        XCTAssertTrue(button.isEnabled)
    }
}
```

## Testing Actors

```swift
final class ActorTests: XCTestCase {
    func testActorIsolation() async throws {
        actor Counter {
            private var value = 0

            func increment() -> Int {
                value += 1
                return value
            }

            func reset() {
                value = 0
            }
        }

        let counter = Counter()

        // Test concurrent access
        await withTaskGroup(of: Int.self) { group in
            for _ in 0..<100 {
                group.addTask {
                    await counter.increment()
                }
            }
        }

        let finalValue = await counter.increment()
        XCTAssertEqual(finalValue, 101)
    }
}
```

## Snapshot Testing

```swift
import SnapshotTesting

final class ViewSnapshotTests: XCTestCase {
    func testButtonAppearance() {
        let button = UIButton()
        button.setTitle("Tap Me", for: .normal)
        button.backgroundColor = .blue
        button.frame = CGRect(x: 0, y: 0, width: 200, height: 50)

        assertSnapshot(matching: button, as: .image)
    }

    func testViewControllerLayout() {
        let vc = MyViewController()
        assertSnapshot(matching: vc, as: .image(on: .iPhone13))
    }

    func testDarkMode() {
        let view = MyView()
        assertSnapshot(matching: view, as: .image(traits: .init(userInterfaceStyle: .dark)))
    }
}
```

## Test Organization

```swift
// MARK: - Test Cases
extension UserManagerTests {
    // MARK: Creation Tests
    func testUserCreation() { }
    func testUserCreationWithInvalidData() { }

    // MARK: Validation Tests
    func testEmailValidation() { }
    func testPasswordValidation() { }

    // MARK: Persistence Tests
    func testUserSave() { }
    func testUserLoad() { }
}

// MARK: - Test Helpers
extension UserManagerTests {
    func makeTestUser() -> User {
        User(name: "Test", email: "test@example.com")
    }

    func setupMockData() {
        // Common test setup
    }
}
```

## Best Practices

- Use `@testable import` to test internal types
- One assertion concept per test (can have multiple XCTAssert calls)
- Use Given-When-Then pattern for clarity
- Name tests descriptively: `test_methodName_condition_expectedResult`
- Use setUp/tearDown for common test setup
- Prefer dependency injection for testability
- Use protocols to enable mocking
- Test edge cases and error conditions
- Use async/await for testing async code
- Measure performance with XCTest metrics
- Use UI testing for critical user flows
- Mock external dependencies
- Keep tests fast and independent
- Use test doubles appropriately (mock, stub, spy, fake)
````

### `SKILL.md`

````markdown
---
name: swift-expert
description: Builds iOS/macOS/watchOS/tvOS applications, implements SwiftUI views and state management, designs protocol-oriented architectures, handles async/await concurrency, implements actors for thread safety, and debugs Swift-specific issues. Use when building iOS/macOS applications with Swift 5.9+, SwiftUI, or async/await concurrency. Invoke for protocol-oriented programming, SwiftUI state management, actors, server-side Swift, UIKit integration, Combine, or Vapor.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: language
  triggers: Swift, SwiftUI, iOS development, macOS development, async/await Swift, Combine, UIKit, Vapor
  role: specialist
  scope: implementation
  output-format: code
  related-skills: 
---

# Swift Expert

## Core Workflow

1. **Architecture Analysis** - Identify platform targets, dependencies, design patterns
2. **Design Protocols** - Create protocol-first APIs with associated types
3. **Implement** - Write type-safe code with async/await and value semantics
4. **Optimize** - Profile with Instruments, ensure thread safety
5. **Test** - Write comprehensive tests with XCTest and async patterns

> **Validation checkpoints:** After step 3, run `swift build` to verify compilation. After step 4, run `swift build -warnings-as-errors` to surface actor isolation and Sendable warnings. After step 5, run `swift test` and confirm all async tests pass.

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| SwiftUI | `references/swiftui-patterns.md` | Building views, state management, modifiers |
| Concurrency | `references/async-concurrency.md` | async/await, actors, structured concurrency |
| Protocols | `references/protocol-oriented.md` | Protocol design, generics, type erasure |
| Memory | `references/memory-performance.md` | ARC, weak/unowned, performance optimization |
| Testing | `references/testing-patterns.md` | XCTest, async tests, mocking strategies |

## Code Patterns

### async/await — Correct vs. Incorrect

```swift
// ✅ DO: async/await with structured error handling
func fetchUser(id: String) async throws -> User {
    let url = URL(string: "https://api.example.com/users/\(id)")!
    let (data, _) = try await URLSession.shared.data(from: url)
    return try JSONDecoder().decode(User.self, from: data)
}

// ❌ DON'T: mixing completion handlers with async context
func fetchUser(id: String) async throws -> User {
    return try await withCheckedThrowingContinuation { continuation in
        // Avoid wrapping existing async APIs this way when a native async version exists
        legacyFetch(id: id) { result in
            continuation.resume(with: result)
        }
    }
}
```

### SwiftUI State Management

```swift
// ✅ DO: use @Observable (Swift 5.9+) for view models
@Observable
final class CounterViewModel {
    var count = 0
    func increment() { count += 1 }
}

struct CounterView: View {
    @State private var vm = CounterViewModel()

    var body: some View {
        VStack {
            Text("\(vm.count)")
            Button("Increment", action: vm.increment)
        }
    }
}

// ❌ DON'T: reach for ObservableObject/Published when @Observable suffices
class LegacyViewModel: ObservableObject {
    @Published var count = 0  // Unnecessary boilerplate in Swift 5.9+
}
```

### Protocol-Oriented Architecture

```swift
// ✅ DO: define capability protocols with associated types
protocol Repository<Entity> {
    associatedtype Entity: Identifiable
    func fetch(id: Entity.ID) async throws -> Entity
    func save(_ entity: Entity) async throws
}

struct UserRepository: Repository {
    typealias Entity = User
    func fetch(id: UUID) async throws -> User { /* … */ }
    func save(_ user: User) async throws { /* … */ }
}

// ❌ DON'T: use classes as base types when a protocol fits
class BaseRepository {  // Avoid class inheritance for shared behavior
    func fetch(id: UUID) async throws -> Any { fatalError("Override required") }
}
```

### Actor for Thread Safety

```swift
// ✅ DO: isolate mutable shared state in an actor
actor ImageCache {
    private var cache: [URL: UIImage] = [:]

    func image(for url: URL) -> UIImage? { cache[url] }
    func store(_ image: UIImage, for url: URL) { cache[url] = image }
}

// ❌ DON'T: use a class with manual locking
class UnsafeImageCache {
    private var cache: [URL: UIImage] = [:]
    private let lock = NSLock()  // Error-prone; prefer actor isolation
    func image(for url: URL) -> UIImage? {
        lock.lock(); defer { lock.unlock() }
        return cache[url]
    }
}
```

## Constraints

### MUST DO
- Use type hints and inference appropriately
- Follow Swift API Design Guidelines
- Use `async/await` for asynchronous operations (see pattern above)
- Ensure `Sendable` compliance for concurrency
- Use value types (`struct`/`enum`) by default
- Document APIs with markup comments (`/// …`)
- Use property wrappers for cross-cutting concerns
- Profile with Instruments before optimizing

### MUST NOT DO
- Use force unwrapping (`!`) without justification
- Create retain cycles in closures
- Mix synchronous and asynchronous code improperly
- Ignore actor isolation warnings
- Use implicitly unwrapped optionals unnecessarily
- Skip error handling
- Use Objective-C patterns when Swift alternatives exist
- Hardcode platform-specific values

## Output Templates

When implementing Swift features, provide:
1. Protocol definitions and type aliases
2. Model types (structs/classes with value semantics)
3. View implementations (SwiftUI) or view controllers
4. Tests demonstrating usage
5. Brief explanation of architectural decisions

[Documentation](https://jeffallan.github.io/claude-skills/skills/language/swift-expert/)
````
