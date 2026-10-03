# Python

## Provenance

- Repository: `Jeffallan/claude-skills`
- Commit: `882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf`
- Folder: `skills/python-pro`
- Upstream URL: https://github.com/Jeffallan/claude-skills/blob/882ef55e377dbf9a4dbe496bb41ac6ccd0e555cf/skills/python-pro/SKILL.md
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

- [references/async-patterns.md](#referencesasync-patternsmd)
- [references/packaging.md](#referencespackagingmd)
- [references/standard-library.md](#referencesstandard-librarymd)
- [references/testing.md](#referencestestingmd)
- [references/type-system.md](#referencestype-systemmd)
- [SKILL.md](#skillmd)

## Inclusion manifest

| Path | Bytes | SHA-256 |
| --- | ---: | --- |
| `references/async-patterns.md` | 9333 | `b7986eb185a4858de3edcb27f537a38d351d3017fdbcac3ba2d905d30ba1cb64` |
| `references/packaging.md` | 9652 | `483d0a257907d2e17ce1cf2e3e7b8b2af88f9eb17fa3a9c4bcc04aa60e930ae3` |
| `references/standard-library.md` | 9063 | `d2997c8f9a491561947c95a182e09b2d584d828d26cb04eb42a194fa4393c6ce` |
| `references/testing.md` | 9920 | `81c8bc148eaf7d32e51171c997016c7deda140b71d6253b15b63b10f038f3c28` |
| `references/type-system.md` | 6638 | `62c4474c4ed29a18fd64002a356cba0239785f68c8530109c74c5bb3162b021b` |
| `SKILL.md` | 6094 | `83acbb761bc372bb8f3df377a4a8f5c3bfb0b95e3d38eebd2e9ee320be255859` |

## Transitive omissions

- {"skill":"fastapi-expert","status":"Related skill outside this source folder; not embedded."}
- {"skill":"devops-engineer","status":"Related skill outside this source folder; not embedded."}

## Files

### `references/async-patterns.md`

````markdown
# Async Programming Patterns

## Basic Async/Await

```python
import asyncio
from collections.abc import Coroutine

# Basic async function
async def fetch_data(url: str) -> dict[str, str]:
    await asyncio.sleep(1)  # Simulate I/O
    return {"url": url, "status": "ok"}

# Running async code
async def main() -> None:
    result = await fetch_data("https://api.example.com")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())

# Multiple concurrent operations
async def fetch_all(urls: list[str]) -> list[dict[str, str]]:
    tasks = [fetch_data(url) for url in urls]
    return await asyncio.gather(*tasks)

# Error handling with gather
async def safe_fetch_all(urls: list[str]) -> list[dict[str, str] | None]:
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return [r if not isinstance(r, Exception) else None for r in results]
```

## Task Groups (Python 3.11+)

```python
from asyncio import TaskGroup

# Task groups for structured concurrency
async def process_batch(items: list[int]) -> list[int]:
    results: list[int] = []

    async with TaskGroup() as tg:
        tasks = [tg.create_task(process_item(item)) for item in items]

    # All tasks complete before this line
    return [task.result() for task in tasks]

# Error handling with TaskGroup
async def robust_processing(items: list[str]) -> tuple[list[str], list[Exception]]:
    results: list[str] = []
    errors: list[Exception] = []

    try:
        async with TaskGroup() as tg:
            for item in items:
                tg.create_task(process_item_safe(item))
    except ExceptionGroup as eg:
        for exc in eg.exceptions:
            errors.append(exc)

    return results, errors
```

## Async Context Managers

```python
from typing import Self
from collections.abc import AsyncIterator

class AsyncDatabaseConnection:
    def __init__(self, url: str) -> None:
        self.url = url
        self._conn: Connection | None = None

    async def __aenter__(self) -> Self:
        self._conn = await connect(self.url)
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any,
    ) -> None:
        if self._conn:
            await self._conn.close()

    async def query(self, sql: str) -> list[dict[str, Any]]:
        if not self._conn:
            raise RuntimeError("Not connected")
        return await self._conn.execute(sql)

# Usage
async def get_users() -> list[dict[str, Any]]:
    async with AsyncDatabaseConnection("postgresql://...") as db:
        return await db.query("SELECT * FROM users")

# Async context manager with contextlib
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_session() -> AsyncIterator[Session]:
    session = await create_session()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
```

## Async Generators

```python
from collections.abc import AsyncIterator

# Async generator for streaming data
async def read_lines(filepath: str) -> AsyncIterator[str]:
    async with aiofiles.open(filepath) as f:
        async for line in f:
            yield line.strip()

# Process stream
async def process_file(filepath: str) -> int:
    count = 0
    async for line in read_lines(filepath):
        await process_line(line)
        count += 1
    return count

# Async generator with cleanup
async def fetch_paginated(url: str) -> AsyncIterator[dict[str, Any]]:
    page = 1
    session = await create_session()
    try:
        while True:
            data = await session.get(f"{url}?page={page}")
            if not data:
                break
            yield data
            page += 1
    finally:
        await session.close()
```

## Async Comprehensions

```python
# Async list comprehension
async def fetch_all_users(user_ids: list[int]) -> list[User]:
    return [user async for user in fetch_users(user_ids)]

# Async dict comprehension
async def build_user_map(user_ids: list[int]) -> dict[int, User]:
    return {
        user.id: user
        async for user in fetch_users(user_ids)
    }

# Conditional async comprehension
async def get_active_users(user_ids: list[int]) -> list[User]:
    return [
        user
        async for user in fetch_users(user_ids)
        if user.is_active
    ]
```

## Synchronization Primitives

```python
import asyncio

# Lock for critical sections
class SharedResource:
    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._data: dict[str, Any] = {}

    async def update(self, key: str, value: Any) -> None:
        async with self._lock:
            # Critical section
            current = self._data.get(key, 0)
            await asyncio.sleep(0.1)  # Simulate processing
            self._data[key] = current + value

# Semaphore for rate limiting
class RateLimiter:
    def __init__(self, max_concurrent: int) -> None:
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def process(self, item: str) -> str:
        async with self._semaphore:
            return await expensive_operation(item)

# Event for coordination
class AsyncWorker:
    def __init__(self) -> None:
        self._ready = asyncio.Event()
        self._shutdown = asyncio.Event()

    async def start(self) -> None:
        # Initialization
        await self._initialize()
        self._ready.set()

        # Wait for shutdown
        await self._shutdown.wait()

    async def wait_ready(self) -> None:
        await self._ready.wait()

    def stop(self) -> None:
        self._shutdown.set()
```

## Async Queue Patterns

```python
from asyncio import Queue

# Producer-consumer pattern
async def producer(queue: Queue[int], n: int) -> None:
    for i in range(n):
        await queue.put(i)
        await asyncio.sleep(0.1)

async def consumer(queue: Queue[int], name: str) -> None:
    while True:
        item = await queue.get()
        try:
            await process_item(item)
        finally:
            queue.task_done()

async def run_pipeline(num_items: int, num_workers: int) -> None:
    queue: Queue[int] = Queue(maxsize=10)

    # Start producer and consumers
    async with TaskGroup() as tg:
        tg.create_task(producer(queue, num_items))
        for i in range(num_workers):
            tg.create_task(consumer(queue, f"worker-{i}"))

        # Wait for all items to be processed
        await queue.join()
```

## Async Timeouts

```python
# Timeout for single operation
async def fetch_with_timeout(url: str, timeout: float) -> dict[str, Any]:
    try:
        async with asyncio.timeout(timeout):
            return await fetch_data(url)
    except TimeoutError:
        return {"error": "timeout"}

# Timeout for multiple operations
async def fetch_all_with_timeout(
    urls: list[str],
    timeout: float
) -> list[dict[str, Any] | None]:
    try:
        async with asyncio.timeout(timeout):
            return await fetch_all(urls)
    except TimeoutError:
        return [None] * len(urls)
```

## Background Tasks

```python
from asyncio import create_task, Task

class BackgroundTaskManager:
    def __init__(self) -> None:
        self._tasks: set[Task[None]] = set()

    def create_task(self, coro: Coroutine[None, None, None]) -> Task[None]:
        task = create_task(coro)
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)
        return task

    async def shutdown(self) -> None:
        # Cancel all background tasks
        for task in self._tasks:
            task.cancel()
        # Wait for cancellation
        await asyncio.gather(*self._tasks, return_exceptions=True)

# Usage
manager = BackgroundTaskManager()
manager.create_task(background_job())
```

## Async Iteration Protocol

```python
class AsyncRange:
    def __init__(self, start: int, end: int) -> None:
        self.start = start
        self.end = end
        self.current = start

    def __aiter__(self) -> Self:
        return self

    async def __anext__(self) -> int:
        if self.current >= self.end:
            raise StopAsyncIteration
        await asyncio.sleep(0.1)  # Simulate async work
        value = self.current
        self.current += 1
        return value

# Usage
async for i in AsyncRange(0, 5):
    print(i)
```

## Mixing Sync and Async

```python
from concurrent.futures import ThreadPoolExecutor
import functools

# Run sync code in executor
async def run_in_executor(func: Callable[..., T], *args: Any) -> T:
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, func, *args)

# Run async code from sync context
def sync_wrapper(coro: Coroutine[None, None, T]) -> T:
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

# Async wrapper for sync function
def to_async(func: Callable[..., T]) -> Callable[..., Coroutine[None, None, T]]:
    @functools.wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> T:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            functools.partial(func, *args, **kwargs)
        )
    return wrapper
```
````

### `references/packaging.md`

````markdown
# Python Packaging and Project Setup

## Project Structure

```
myproject/
├── pyproject.toml          # Project metadata and dependencies
├── README.md               # Project description
├── .gitignore             # Git ignore patterns
├── .python-version        # Python version for pyenv
├── src/
│   └── myproject/
│       ├── __init__.py    # Package initialization
│       ├── py.typed       # PEP 561 type marker
│       ├── core.py        # Core functionality
│       └── utils.py       # Utilities
├── tests/
│   ├── __init__.py
│   ├── conftest.py        # Pytest configuration
│   └── test_core.py       # Tests
└── docs/
    └── index.md           # Documentation
```

## Pyproject.toml Configuration

```toml
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "myproject"
version = "0.1.0"
description = "A Python project"
readme = "README.md"
requires-python = ">=3.11"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "you@example.com"}
]
keywords = ["python", "package"]
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
    "Typing :: Typed",
]

dependencies = [
    "requests>=2.31.0",
    "pydantic>=2.5.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "mypy>=1.7.0",
    "black>=23.11.0",
    "ruff>=0.1.6",
]
docs = [
    "mkdocs>=1.5.0",
    "mkdocs-material>=9.4.0",
]

[project.scripts]
myproject = "myproject.cli:main"

[project.urls]
Homepage = "https://github.com/username/myproject"
Documentation = "https://myproject.readthedocs.io"
Repository = "https://github.com/username/myproject"
Changelog = "https://github.com/username/myproject/blob/main/CHANGELOG.md"

# Tool configurations
[tool.black]
line-length = 100
target-version = ["py311"]
include = '\.pyi?$'

[tool.ruff]
line-length = 100
target-version = "py311"
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "UP",  # pyupgrade
]
ignore = []

[tool.ruff.per-file-ignores]
"__init__.py" = ["F401"]  # Ignore unused imports in __init__.py

[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[[tool.mypy.overrides]]
module = "third_party.*"
ignore_missing_imports = true

[tool.pytest.ini_options]
minversion = "7.0"
addopts = [
    "-ra",
    "--strict-markers",
    "--strict-config",
    "--cov=myproject",
    "--cov-report=term-missing",
    "--cov-report=html",
]
testpaths = ["tests"]
pythonpath = ["src"]

[tool.coverage.run]
source = ["src"]
branch = true

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
]
```

## Poetry Project Management

```toml
# pyproject.toml for Poetry
[tool.poetry]
name = "myproject"
version = "0.1.0"
description = "A Python project"
authors = ["Your Name <you@example.com>"]
readme = "README.md"
license = "MIT"
packages = [{include = "myproject", from = "src"}]

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"
pydantic = "^2.5.0"

[tool.poetry.group.dev.dependencies]
pytest = "^7.4.0"
pytest-cov = "^4.1.0"
mypy = "^1.7.0"
black = "^23.11.0"
ruff = "^0.1.6"

[tool.poetry.scripts]
myproject = "myproject.cli:main"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
```

```bash
# Poetry commands
poetry init                    # Initialize new project
poetry add requests            # Add dependency
poetry add --group dev pytest  # Add dev dependency
poetry install                 # Install dependencies
poetry update                  # Update dependencies
poetry shell                   # Activate virtual environment
poetry run pytest              # Run command in venv
poetry build                   # Build package
poetry publish                 # Publish to PyPI
poetry export -f requirements.txt --output requirements.txt
```

## Virtual Environments

```bash
# Using venv (built-in)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install in editable mode
pip install -e .
pip install -e ".[dev]"    # With optional dependencies

# Using virtualenv
pip install virtualenv
virtualenv venv
source venv/bin/activate

# Using pyenv for Python version management
pyenv install 3.11.6
pyenv local 3.11.6         # Set for current directory
echo "3.11.6" > .python-version
```

## Package __init__.py

```python
# src/myproject/__init__.py
"""MyProject - A Python package."""

from myproject.core import main_function, CoreClass
from myproject.utils import helper_function

__version__ = "0.1.0"
__all__ = ["main_function", "CoreClass", "helper_function"]

# Package-level configuration
import logging

logger = logging.getLogger(__name__)
logger.addHandler(logging.NullHandler())
```

## Type Stub Files (py.typed)

```python
# src/myproject/py.typed
# Empty file indicates package includes type hints

# src/myproject/__init__.pyi (optional stub file)
from typing import Any

__version__: str

def main_function(arg: str) -> dict[str, Any]: ...

class CoreClass:
    def __init__(self, name: str) -> None: ...
    def process(self) -> str: ...
```

## CLI Entry Points

```python
# src/myproject/cli.py
import sys
from typing import NoReturn

def main() -> NoReturn:
    """Main CLI entry point."""
    print("MyProject CLI")
    sys.exit(0)

if __name__ == "__main__":
    main()
```

## Requirements Files

```bash
# requirements.txt - Production dependencies
requests>=2.31.0,<3.0.0
pydantic>=2.5.0,<3.0.0

# requirements-dev.txt - Development dependencies
-r requirements.txt
pytest>=7.4.0
pytest-cov>=4.1.0
mypy>=1.7.0
black>=23.11.0
ruff>=0.1.6

# Generate from Poetry
poetry export -f requirements.txt --output requirements.txt --without-hashes
poetry export -f requirements.txt --with dev --output requirements-dev.txt
```

## Building and Distribution

```bash
# Build package
python -m build

# Check package
twine check dist/*

# Upload to PyPI
twine upload dist/*

# Upload to Test PyPI
twine upload --repository testpypi dist/*

# Install from Test PyPI
pip install --index-url https://test.pypi.org/simple/ myproject
```

## Setuptools Configuration (Legacy)

```python
# setup.py (if not using pyproject.toml)
from setuptools import setup, find_packages

setup(
    name="myproject",
    version="0.1.0",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.11",
    install_requires=[
        "requests>=2.31.0",
        "pydantic>=2.5.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "mypy>=1.7.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "myproject=myproject.cli:main",
        ],
    },
)
```

## Manifest for Package Data

```
# MANIFEST.in
include README.md
include LICENSE
include pyproject.toml
recursive-include src/myproject *.py
recursive-include src/myproject py.typed
recursive-include tests *.py
prune docs/_build
```

## Version Management

```python
# src/myproject/__version__.py
__version__ = "0.1.0"

# src/myproject/__init__.py
from myproject.__version__ import __version__

# Read version in pyproject.toml
import tomli
from pathlib import Path

def get_version() -> str:
    pyproject = Path(__file__).parent.parent / "pyproject.toml"
    with open(pyproject, "rb") as f:
        data = tomli.load(f)
    return data["project"]["version"]
```

## Dependency Management Best Practices

```python
# Pin dependencies for applications
requests==2.31.0
pydantic==2.5.2

# Use ranges for libraries
requests>=2.31.0,<3.0.0
pydantic>=2.5.0,<3.0.0

# Lock files
# Poetry: poetry.lock
# pip: requirements.txt with exact versions
pip freeze > requirements-lock.txt

# Update dependencies
poetry update
pip install --upgrade -r requirements.txt
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.11", "3.12"]

    steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: ${{ matrix.python-version }}

    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -e ".[dev]"

    - name: Run tests
      run: |
        pytest --cov --cov-report=xml

    - name: Type check
      run: mypy src

    - name: Lint
      run: |
        black --check src tests
        ruff check src tests

    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 23.11.0
    hooks:
      - id: black

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.6
    hooks:
      - id: ruff
        args: [--fix, --exit-non-zero-on-fix]

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
```

```bash
# Install pre-commit
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files
```
````

### `references/standard-library.md`

````markdown
# Standard Library Mastery

## Pathlib for File Operations

```python
from pathlib import Path

# Path creation and manipulation
project_root = Path(__file__).parent.parent
config_file = project_root / "config" / "settings.toml"
data_dir = Path.home() / "data"

# File operations
def read_config(config_path: Path) -> dict[str, str]:
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {config_path}")

    # Read text
    content = config_path.read_text(encoding="utf-8")

    # Read bytes
    binary = config_path.read_bytes()

    return parse_config(content)

# Path traversal
def find_python_files(directory: Path) -> list[Path]:
    # Recursive glob
    return list(directory.rglob("*.py"))

def get_file_info(path: Path) -> dict[str, Any]:
    stat = path.stat()
    return {
        "size": stat.st_size,
        "modified": stat.st_mtime,
        "is_file": path.is_file(),
        "is_dir": path.is_dir(),
        "suffix": path.suffix,
        "stem": path.stem,
    }

# Creating directories
def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)

# Temporary files
from tempfile import TemporaryDirectory
from pathlib import Path

def process_with_temp() -> None:
    with TemporaryDirectory() as tmpdir:
        temp_path = Path(tmpdir) / "output.txt"
        temp_path.write_text("data")
```

## Dataclasses for Data Structures

```python
from dataclasses import dataclass, field, asdict, replace
from typing import ClassVar

# Basic dataclass
@dataclass
class User:
    id: int
    name: str
    email: str
    active: bool = True

# Post-init processing
@dataclass
class Product:
    name: str
    price: float
    discount: float = 0.0

    def __post_init__(self) -> None:
        if self.discount > 1.0:
            raise ValueError("Discount must be <= 1.0")

    @property
    def final_price(self) -> float:
        return self.price * (1 - self.discount)

# Field with factory
@dataclass
class ShoppingCart:
    user_id: int
    items: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

# Frozen dataclass (immutable)
@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance(self, other: "Point") -> float:
        return ((self.x - other.x)**2 + (self.y - other.y)**2)**0.5

# Class variables
@dataclass
class Config:
    API_VERSION: ClassVar[str] = "v1"
    BASE_URL: ClassVar[str] = "https://api.example.com"

    timeout: int = 30
    retries: int = 3

# Ordered dataclass for comparison
@dataclass(order=True)
class Priority:
    level: int
    name: str = field(compare=False)

# Convert to/from dict
user = User(1, "Alice", "alice@example.com")
user_dict = asdict(user)
updated = replace(user, name="Alice Smith")
```

## Functools for Function Tools

```python
from functools import (
    cache, lru_cache, cached_property,
    partial, wraps, reduce, singledispatch
)

# Caching
@cache  # Unlimited cache (Python 3.9+)
def fibonacci(n: int) -> int:
    if n < 2:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

@lru_cache(maxsize=128)  # LRU cache with size limit
def fetch_user(user_id: int) -> dict[str, Any]:
    # Expensive database call
    return {"id": user_id, "name": "User"}

# Cached property
class DataProcessor:
    def __init__(self, data: list[int]) -> None:
        self._data = data

    @cached_property
    def mean(self) -> float:
        """Computed once, then cached."""
        return sum(self._data) / len(self._data)

# Partial application
from operator import mul

double = partial(mul, 2)
triple = partial(mul, 3)
print(double(5))  # 10

# Decorator preservation
def timing_decorator(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.2f}s")
        return result
    return wrapper

# Reduce for aggregation
from operator import add

total = reduce(add, [1, 2, 3, 4, 5])  # 15
product = reduce(mul, [1, 2, 3, 4], 1)  # 24

# Single dispatch for polymorphism
@singledispatch
def process(arg: Any) -> str:
    return f"Unknown type: {type(arg)}"

@process.register
def _(arg: int) -> str:
    return f"Integer: {arg * 2}"

@process.register
def _(arg: str) -> str:
    return f"String: {arg.upper()}"

@process.register(list)
def _(arg: list[Any]) -> str:
    return f"List with {len(arg)} items"
```

## Itertools for Iteration

```python
from itertools import (
    chain, islice, cycle, repeat,
    groupby, accumulate, combinations, permutations,
    product, zip_longest, tee, filterfalse
)

# Chain multiple iterables
combined = list(chain([1, 2], [3, 4], [5, 6]))  # [1,2,3,4,5,6]

# Slice iterator (memory efficient)
first_10 = list(islice(range(1000), 10))

# Infinite iterators
from itertools import count
counter = count(start=1, step=2)  # 1, 3, 5, 7, ...

# Groupby for grouping
data = [("A", 1), ("A", 2), ("B", 1), ("B", 2)]
grouped = {k: list(v) for k, v in groupby(data, key=lambda x: x[0])}

# Accumulate for running totals
cumsum = list(accumulate([1, 2, 3, 4, 5]))  # [1, 3, 6, 10, 15]

# Combinations and permutations
combos = list(combinations([1, 2, 3], 2))  # [(1,2), (1,3), (2,3)]
perms = list(permutations([1, 2, 3], 2))  # [(1,2), (1,3), (2,1), ...]

# Cartesian product
pairs = list(product([1, 2], ['a', 'b']))  # [(1,'a'), (1,'b'), (2,'a'), (2,'b')]

# Zip with different lengths
from itertools import zip_longest
paired = list(zip_longest([1, 2], ['a', 'b', 'c'], fillvalue=0))

# Tee for multiple iterators
it1, it2 = tee(range(5), 2)

# Filter false
odds = list(filterfalse(lambda x: x % 2 == 0, range(10)))
```

## Collections for Data Structures

```python
from collections import (
    defaultdict, Counter, deque, namedtuple,
    ChainMap, OrderedDict
)

# defaultdict for automatic defaults
word_index: defaultdict[str, list[int]] = defaultdict(list)
for i, word in enumerate(["hello", "world", "hello"]):
    word_index[word].append(i)

# Counter for counting
from collections import Counter

word_counts = Counter(["apple", "banana", "apple", "cherry", "banana", "apple"])
print(word_counts.most_common(2))  # [('apple', 3), ('banana', 2)]

# Counter operations
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)  # Counter({'a': 4, 'b': 3})

# deque for efficient queue operations
from collections import deque

queue: deque[str] = deque()
queue.append("first")
queue.append("second")
queue.appendleft("priority")
item = queue.popleft()  # "priority"

# Ring buffer with maxlen
recent: deque[int] = deque(maxlen=3)
for i in range(5):
    recent.append(i)  # Only keeps last 3

# namedtuple for lightweight classes
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(1, 2)
print(p.x, p.y)

# ChainMap for layered configs
from collections import ChainMap

defaults = {'color': 'red', 'user': 'guest'}
environment = {'user': 'admin'}
combined = ChainMap(environment, defaults)
print(combined['user'])  # 'admin' (from environment)
```

## Context Managers

```python
from contextlib import contextmanager, suppress, ExitStack

# Custom context manager
@contextmanager
def managed_resource(resource_id: str) -> Iterator[Resource]:
    resource = acquire_resource(resource_id)
    try:
        yield resource
    finally:
        release_resource(resource)

# Suppress exceptions
with suppress(FileNotFoundError):
    Path("nonexistent.txt").unlink()

# ExitStack for dynamic context managers
def process_files(filenames: list[str]) -> None:
    with ExitStack() as stack:
        files = [stack.enter_context(open(fn)) for fn in filenames]
        # All files auto-closed on exit
        for f in files:
            process(f.read())
```

## Enum for Constants

```python
from enum import Enum, auto, IntEnum, Flag

# Basic enum
class Status(Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# Auto values
class Color(Enum):
    RED = auto()
    GREEN = auto()
    BLUE = auto()

# IntEnum for numeric values
class Priority(IntEnum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3

# Flag for bit flags
class Permission(Flag):
    READ = auto()
    WRITE = auto()
    EXECUTE = auto()

user_perms = Permission.READ | Permission.WRITE
if Permission.READ in user_perms:
    print("Can read")
```

## Logging

```python
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Structured logging
def process_user(user_id: int) -> None:
    logger.info("Processing user", extra={"user_id": user_id})
    try:
        # Process...
        logger.debug("User data loaded", extra={"user_id": user_id})
    except Exception as e:
        logger.exception("Failed to process user", extra={"user_id": user_id})
```
````

### `references/testing.md`

````markdown
# Testing with Pytest

## Basic Pytest Structure

```python
# test_user.py
import pytest
from myapp.user import User, UserService

# Simple test function
def test_user_creation() -> None:
    user = User(id=1, name="Alice", email="alice@example.com")
    assert user.name == "Alice"
    assert user.is_active is True

# Test with multiple assertions
def test_user_validation() -> None:
    with pytest.raises(ValueError, match="Invalid email"):
        User(id=1, name="Alice", email="invalid")

# Test class for grouping
class TestUserService:
    def test_find_user(self) -> None:
        service = UserService()
        user = service.find(1)
        assert user is not None

    def test_create_user(self) -> None:
        service = UserService()
        user = service.create(name="Bob", email="bob@example.com")
        assert user.id > 0
```

## Fixtures for Setup/Teardown

```python
# conftest.py - shared fixtures
import pytest
from typing import Iterator
from myapp.database import Database, Session

@pytest.fixture
def db() -> Iterator[Database]:
    """Provide database instance with cleanup."""
    database = Database("test.db")
    database.create_tables()
    yield database
    database.drop_tables()
    database.close()

@pytest.fixture
def db_session(db: Database) -> Iterator[Session]:
    """Provide database session with rollback."""
    session = db.create_session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def sample_user() -> User:
    """Provide test user."""
    return User(id=1, name="Test User", email="test@example.com")

# Using fixtures in tests
def test_user_creation(db_session: Session, sample_user: User) -> None:
    db_session.add(sample_user)
    db_session.commit()

    retrieved = db_session.query(User).filter_by(id=1).first()
    assert retrieved.name == "Test User"

# Fixture with parameters
@pytest.fixture(params=["sqlite", "postgresql", "mysql"])
def db_engine(request: pytest.FixtureRequest) -> str:
    return request.param

def test_connection(db_engine: str) -> None:
    # Test runs 3 times with different engines
    assert create_connection(db_engine)

# Autouse fixture (runs automatically)
@pytest.fixture(autouse=True)
def reset_state() -> Iterator[None]:
    """Reset global state before each test."""
    clear_caches()
    yield
    cleanup_temp_files()
```

## Parametrize for Multiple Cases

```python
import pytest

# Parametrize test function
@pytest.mark.parametrize(
    "input,expected",
    [
        (2, 4),
        (3, 9),
        (4, 16),
        (-2, 4),
    ]
)
def test_square(input: int, expected: int) -> None:
    assert square(input) == expected

# Multiple parameters
@pytest.mark.parametrize("base", [2, 10])
@pytest.mark.parametrize("exponent", [0, 1, 2])
def test_power(base: int, exponent: int) -> None:
    result = base ** exponent
    assert result >= 0

# Parametrize with IDs
@pytest.mark.parametrize(
    "email,valid",
    [
        ("user@example.com", True),
        ("invalid", False),
        ("@example.com", False),
        ("user@", False),
    ],
    ids=["valid", "no_at", "no_user", "no_domain"]
)
def test_email_validation(email: str, valid: bool) -> None:
    assert is_valid_email(email) == valid

# Parametrize with fixtures
@pytest.fixture
def user_factory():
    def _make_user(name: str, active: bool = True) -> User:
        return User(name=name, active=active)
    return _make_user

@pytest.mark.parametrize("name", ["Alice", "Bob", "Charlie"])
def test_user_names(user_factory, name: str) -> None:
    user = user_factory(name)
    assert user.name == name
```

## Mocking and Patching

```python
from unittest.mock import Mock, MagicMock, patch, AsyncMock, call
import pytest

# Mock object
def test_api_call_with_mock() -> None:
    mock_client = Mock()
    mock_client.get.return_value = {"status": "ok"}

    service = ApiService(mock_client)
    result = service.fetch_data()

    mock_client.get.assert_called_once_with("/api/data")
    assert result["status"] == "ok"

# Patch function/method
def test_database_call() -> None:
    with patch("myapp.database.connect") as mock_connect:
        mock_connect.return_value = Mock()

        db = Database()
        db.connect()

        mock_connect.assert_called_once()

# Patch as decorator
@patch("myapp.user.send_email")
def test_user_registration(mock_send_email: Mock) -> None:
    service = UserService()
    service.register("user@example.com")

    mock_send_email.assert_called_with(
        to="user@example.com",
        subject="Welcome"
    )

# Multiple patches
@patch("myapp.api.requests.get")
@patch("myapp.api.cache.get")
def test_cached_api(mock_cache: Mock, mock_requests: Mock) -> None:
    mock_cache.return_value = None
    mock_requests.return_value.json.return_value = {"data": "value"}

    result = fetch_with_cache("key")

    mock_cache.assert_called_once_with("key")
    mock_requests.assert_called_once()

# Mock side effects
def test_retry_logic() -> None:
    mock_api = Mock()
    mock_api.call.side_effect = [
        ConnectionError("Failed"),
        ConnectionError("Failed"),
        {"status": "ok"}
    ]

    result = retry_api_call(mock_api)
    assert result["status"] == "ok"
    assert mock_api.call.call_count == 3

# Async mock
@pytest.mark.asyncio
async def test_async_function() -> None:
    mock_db = AsyncMock()
    mock_db.fetch_user.return_value = User(id=1, name="Alice")

    service = AsyncUserService(mock_db)
    user = await service.get_user(1)

    mock_db.fetch_user.assert_awaited_once_with(1)
    assert user.name == "Alice"
```

## Async Testing

```python
import pytest
import asyncio

# Mark async test
@pytest.mark.asyncio
async def test_async_fetch() -> None:
    result = await fetch_data("https://api.example.com")
    assert result["status"] == "ok"

# Async fixture
@pytest.fixture
async def async_db() -> AsyncIterator[AsyncDatabase]:
    db = AsyncDatabase()
    await db.connect()
    yield db
    await db.disconnect()

@pytest.mark.asyncio
async def test_async_query(async_db: AsyncDatabase) -> None:
    result = await async_db.query("SELECT * FROM users")
    assert len(result) > 0

# Test concurrent operations
@pytest.mark.asyncio
async def test_concurrent_requests() -> None:
    urls = ["http://example.com/1", "http://example.com/2"]
    results = await asyncio.gather(*[fetch(url) for url in urls])
    assert len(results) == 2
```

## Pytest Markers

```python
import pytest

# Skip test
@pytest.mark.skip(reason="Not implemented yet")
def test_future_feature() -> None:
    pass

# Conditional skip
@pytest.mark.skipif(sys.version_info < (3, 11), reason="Requires Python 3.11+")
def test_new_feature() -> None:
    pass

# Expected failure
@pytest.mark.xfail(reason="Known bug #123")
def test_known_bug() -> None:
    assert buggy_function() == expected_value

# Custom markers
@pytest.mark.slow
def test_slow_operation() -> None:
    time.sleep(5)
    assert True

@pytest.mark.integration
def test_integration() -> None:
    assert external_service.ping()

# Run with: pytest -m "not slow"
```

## Test Coverage

```python
# Run with coverage
# pytest --cov=myapp --cov-report=html --cov-report=term

# conftest.py - coverage configuration
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "unit: mark test as unit test"
    )

# pytest.ini or pyproject.toml
"""
[tool.pytest.ini_options]
minversion = "7.0"
addopts = [
    "--cov=myapp",
    "--cov-report=term-missing",
    "--cov-fail-under=90",
    "-ra",
    "--strict-markers",
]
testpaths = ["tests"]
"""
```

## Property-Based Testing

```python
from hypothesis import given, strategies as st

# Property-based test
@given(st.integers(), st.integers())
def test_addition_commutative(a: int, b: int) -> None:
    assert a + b == b + a

@given(st.lists(st.integers()))
def test_sorted_is_ordered(lst: list[int]) -> None:
    sorted_lst = sorted(lst)
    for i in range(len(sorted_lst) - 1):
        assert sorted_lst[i] <= sorted_lst[i + 1]

# Custom strategies
@given(st.emails())
def test_email_validation(email: str) -> None:
    assert "@" in email
    assert validate_email(email)

# Composite strategies
from hypothesis import strategies as st
from hypothesis.strategies import composite

@composite
def users(draw) -> User:
    return User(
        id=draw(st.integers(min_value=1)),
        name=draw(st.text(min_size=1, max_size=50)),
        email=draw(st.emails()),
        age=draw(st.integers(min_value=18, max_value=120))
    )

@given(users())
def test_user_creation(user: User) -> None:
    assert user.age >= 18
    assert len(user.name) > 0
```

## Test Organization

```python
# tests/
#   conftest.py          - Shared fixtures
#   test_user.py         - User tests
#   test_api.py          - API tests
#   integration/
#     test_workflow.py   - Integration tests
#   unit/
#     test_models.py     - Unit tests

# Fixture factory pattern
@pytest.fixture
def user_factory(db_session: Session):
    created_users: list[User] = []

    def _create_user(
        name: str = "Test User",
        email: str | None = None,
        **kwargs
    ) -> User:
        if email is None:
            email = f"{name.lower().replace(' ', '.')}@example.com"

        user = User(name=name, email=email, **kwargs)
        db_session.add(user)
        db_session.commit()
        created_users.append(user)
        return user

    yield _create_user

    # Cleanup
    for user in created_users:
        db_session.delete(user)
    db_session.commit()
```

## Snapshot Testing

```python
import pytest
from syrupy.assertion import SnapshotAssertion

def test_api_response(snapshot: SnapshotAssertion) -> None:
    response = api.get_user(1)
    assert response == snapshot

def test_rendered_template(snapshot: SnapshotAssertion) -> None:
    html = render_template("user.html", user=get_user(1))
    assert html == snapshot
```
````

### `references/type-system.md`

````markdown
# Type System Mastery

## Basic Type Annotations

```python
from typing import Any
from collections.abc import Sequence, Mapping

# Function signatures
def process_user(name: str, age: int, active: bool = True) -> dict[str, Any]:
    return {"name": name, "age": age, "active": active}

# Use | for unions (Python 3.10+)
def find_user(user_id: int | str) -> dict[str, Any] | None:
    if isinstance(user_id, int):
        return {"id": user_id}
    return None

# Collections - prefer collections.abc
def process_items(items: Sequence[str]) -> list[str]:
    """Accepts list, tuple, or any sequence."""
    return [item.upper() for item in items]

def merge_configs(base: Mapping[str, int], override: dict[str, int]) -> dict[str, int]:
    """Mapping for read-only, dict for mutable."""
    return {**base, **override}
```

## Generic Types

```python
from typing import TypeVar, Generic, Protocol
from collections.abc import Callable

T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

# Generic function
def first_element(items: Sequence[T]) -> T | None:
    return items[0] if items else None

# Generic class
class Cache(Generic[K, V]):
    def __init__(self) -> None:
        self._data: dict[K, V] = {}

    def get(self, key: K) -> V | None:
        return self._data.get(key)

    def set(self, key: K, value: V) -> None:
        self._data[key] = value

# Usage
user_cache: Cache[int, str] = Cache()
user_cache.set(1, "Alice")

# Constrained TypeVar
from numbers import Number
NumT = TypeVar('NumT', bound=Number)

def add_numbers(a: NumT, b: NumT) -> NumT:
    return a + b  # type: ignore[return-value]
```

## Protocol for Structural Typing

```python
from typing import Protocol, runtime_checkable

# Define interface without inheritance
class Drawable(Protocol):
    def draw(self) -> str:
        ...

    @property
    def color(self) -> str:
        ...

class Circle:
    def __init__(self, radius: float, color: str) -> None:
        self.radius = radius
        self._color = color

    def draw(self) -> str:
        return f"Drawing {self._color} circle"

    @property
    def color(self) -> str:
        return self._color

# Circle implements Drawable without inheriting
def render(shape: Drawable) -> str:
    return shape.draw()

# Runtime checkable protocol
@runtime_checkable
class Closeable(Protocol):
    def close(self) -> None:
        ...

def cleanup(resource: Closeable) -> None:
    if isinstance(resource, Closeable):
        resource.close()
```

## Advanced Type Features

```python
from typing import Literal, TypeAlias, TypedDict, NotRequired, Self, overload

# Literal types for constants
Mode = Literal["read", "write", "append"]

def open_file(path: str, mode: Mode) -> None:
    ...

# Type aliases for complex types
JsonDict: TypeAlias = dict[str, Any]
UserId: TypeAlias = int | str

# TypedDict for structured dictionaries
class UserDict(TypedDict):
    id: int
    name: str
    email: str
    age: NotRequired[int]  # Optional field

def create_user(data: UserDict) -> None:
    print(data["name"])  # Type-safe access

# Self type for method chaining
class Builder:
    def __init__(self) -> None:
        self._value = 0

    def add(self, n: int) -> Self:
        self._value += n
        return self

    def multiply(self, n: int) -> Self:
        self._value *= n
        return self

# Overload for different signatures
@overload
def process(data: str) -> str: ...

@overload
def process(data: int) -> int: ...

def process(data: str | int) -> str | int:
    if isinstance(data, str):
        return data.upper()
    return data * 2
```

## Callable Types

```python
from collections.abc import Callable
from typing import ParamSpec, Concatenate

# Basic callable
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

# ParamSpec for preserving signatures
P = ParamSpec('P')
R = TypeVar('R')

def logging_decorator(func: Callable[P, R]) -> Callable[P, R]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

# Concatenate for dependency injection
def with_connection(
    func: Callable[Concatenate[Connection, P], R]
) -> Callable[P, R]:
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        conn = get_connection()
        return func(conn, *args, **kwargs)
    return wrapper

# Usage
@with_connection
def query_user(conn: Connection, user_id: int) -> User:
    return conn.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

## Mypy Configuration

```toml
# pyproject.toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
disallow_subclassing_any = true
disallow_untyped_calls = true
disallow_incomplete_defs = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_no_return = true
warn_unreachable = true
strict_equality = true

[[tool.mypy.overrides]]
module = "third_party.*"
ignore_missing_imports = true
```

## Common Type Patterns

```python
# Result type pattern
from dataclasses import dataclass

@dataclass
class Success(Generic[T]):
    value: T

@dataclass
class Error:
    message: str

Result = Success[T] | Error

def divide(a: int, b: int) -> Result[float]:
    if b == 0:
        return Error("Division by zero")
    return Success(a / b)

# Option/Maybe type
def safe_get(items: Sequence[T], index: int) -> T | None:
    try:
        return items[index]
    except IndexError:
        return None

# Sentinel value with typing
from typing import Final

MISSING: Final = object()

def get_value(key: str, default: T | type[MISSING] = MISSING) -> T:
    if default is MISSING:
        raise KeyError(key)
    return default  # type: ignore[return-value]
```

## Type Narrowing

```python
from typing import assert_type, assert_never

def process_value(value: int | str | None) -> str:
    # Type guards
    if value is None:
        return "null"

    if isinstance(value, int):
        # Type narrowed to int
        return str(value * 2)

    # Type narrowed to str
    return value.upper()

# Exhaustiveness checking
def handle_mode(mode: Literal["read", "write"]) -> str:
    if mode == "read":
        return "Reading"
    elif mode == "write":
        return "Writing"
    else:
        # Mypy will error if mode can be anything else
        assert_never(mode)

# Custom type guard
def is_string_list(val: list[Any]) -> bool:
    """Runtime check for list of strings."""
    return all(isinstance(x, str) for x in val)
```
````

### `SKILL.md`

````markdown
---
name: python-pro
description: Use when building Python 3.11+ applications requiring type safety, async programming, or robust error handling. Generates type-annotated Python code, configures mypy in strict mode, writes pytest test suites with fixtures and mocking, and validates code with black and ruff. Invoke for type hints, async/await patterns, dataclasses, dependency injection, logging configuration, and structured error handling.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: language
  triggers: Python development, type hints, async Python, pytest, mypy, dataclasses, Python best practices, Pythonic code
  role: specialist
  scope: implementation
  output-format: code
  related-skills: fastapi-expert, devops-engineer
---

# Python Pro

Modern Python 3.11+ specialist focused on type-safe, async-first, production-ready code.

## When to Use This Skill

- Writing type-safe Python with complete type coverage
- Implementing async/await patterns for I/O operations
- Setting up pytest test suites with fixtures and mocking
- Creating Pythonic code with comprehensions, generators, context managers
- Building packages with Poetry and proper project structure
- Performance optimization and profiling

## Core Workflow

1. **Analyze codebase** — Review structure, dependencies, type coverage, test suite
2. **Design interfaces** — Define protocols, dataclasses, type aliases
3. **Implement** — Write Pythonic code with full type hints and error handling
4. **Test** — Create comprehensive pytest suite with >90% coverage
5. **Validate** — Run `mypy --strict`, `black`, `ruff`
   - If mypy fails: fix type errors reported and re-run before proceeding
   - If tests fail: debug assertions, update fixtures, and iterate until green
   - If ruff/black reports issues: apply auto-fixes, then re-validate

## Reference Guide

Load detailed guidance based on context:

| Topic | Reference | Load When |
|-------|-----------|-----------|
| Type System | `references/type-system.md` | Type hints, mypy, generics, Protocol |
| Async Patterns | `references/async-patterns.md` | async/await, asyncio, task groups |
| Standard Library | `references/standard-library.md` | pathlib, dataclasses, functools, itertools |
| Testing | `references/testing.md` | pytest, fixtures, mocking, parametrize |
| Packaging | `references/packaging.md` | poetry, pip, pyproject.toml, distribution |

## Constraints

### MUST DO
- Type hints for all function signatures and class attributes
- PEP 8 compliance with black formatting
- Comprehensive docstrings (Google style)
- Test coverage exceeding 90% with pytest
- Use `X | None` instead of `Optional[X]` (Python 3.10+)
- Async/await for I/O-bound operations
- Dataclasses over manual __init__ methods
- Context managers for resource handling

### MUST NOT DO
- Skip type annotations on public APIs
- Use mutable default arguments
- Mix sync and async code improperly
- Ignore mypy errors in strict mode
- Use bare except clauses
- Hardcode secrets or configuration
- Use deprecated stdlib modules (use pathlib not os.path)

## Code Examples

### Type-annotated function with error handling
```python
from pathlib import Path

def read_config(path: Path) -> dict[str, str]:
    """Read configuration from a file.

    Args:
        path: Path to the configuration file.

    Returns:
        Parsed key-value configuration entries.

    Raises:
        FileNotFoundError: If the config file does not exist.
        ValueError: If a line cannot be parsed.
    """
    config: dict[str, str] = {}
    with path.open() as f:
        for line in f:
            key, _, value = line.partition("=")
            if not key.strip():
                raise ValueError(f"Invalid config line: {line!r}")
            config[key.strip()] = value.strip()
    return config
```

### Dataclass with validation
```python
from dataclasses import dataclass, field

@dataclass
class AppConfig:
    host: str
    port: int
    debug: bool = False
    allowed_origins: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not (1 <= self.port <= 65535):
            raise ValueError(f"Invalid port: {self.port}")
```

### Async pattern
```python
import asyncio
import httpx

async def fetch_all(urls: list[str]) -> list[bytes]:
    """Fetch multiple URLs concurrently."""
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [r.content for r in responses]
```

### pytest fixture and parametrize
```python
import pytest
from pathlib import Path

@pytest.fixture
def config_file(tmp_path: Path) -> Path:
    cfg = tmp_path / "config.txt"
    cfg.write_text("host=localhost\nport=8080\n")
    return cfg

@pytest.mark.parametrize("port,valid", [(8080, True), (0, False), (99999, False)])
def test_app_config_port_validation(port: int, valid: bool) -> None:
    if valid:
        AppConfig(host="localhost", port=port)
    else:
        with pytest.raises(ValueError):
            AppConfig(host="localhost", port=port)
```

### mypy strict configuration (pyproject.toml)
```toml
[tool.mypy]
python_version = "3.11"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

Clean `mypy --strict` output looks like:
```
Success: no issues found in 12 source files
```
Any reported error (e.g., `error: Function is missing a return type annotation`) must be resolved before the implementation is considered complete.

## Output Templates

When implementing Python features, provide:
1. Module file with complete type hints
2. Test file with pytest fixtures
3. Type checking confirmation (mypy --strict passes)
4. Brief explanation of Pythonic patterns used

## Knowledge Reference

Python 3.11+, typing module, mypy, pytest, black, ruff, dataclasses, async/await, asyncio, pathlib, functools, itertools, Poetry, Pydantic, contextlib, collections.abc, Protocol

[Documentation](https://jeffallan.github.io/claude-skills/skills/language/python-pro/)
````
