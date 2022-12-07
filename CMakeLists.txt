cmake_minimum_required(VERSION 3.25)
project (ben)
include_directories(include)
include_directories(assets)
set(SOURCES src/index.cpp src/Ball.cpp)

add_executable(ben ${SOURCES})
set_property(TARGET ben PROPERTY CXX_STANDARD 17)


message(STATUS "set env var")
set(ENV{CC} "/opt/homebrew/opt/llvm/bin/clang")
set(ENV{CXX} "/opt/homebrew/opt/llvm/bin/clang++")
set(ENV{LDFLAGS} "-L/opt/homebrew/opt/llvm/lib")
set(ENV{CPPFLAGS} "-I/opt/homebrew/opt/llvm/include")

include_directories("/opt/homebrew/include" "/opt/homebrew/opt/llvm/include")
link_directories("/opt/homebrew/lib" "/opt/homebrew/opt/llvm/lib")


find_package(OpenMP)

# Add SFML, not entirely sure I need all of these but whatever
find_package(SFML 2.5.1 COMPONENTS system window graphics network audio REQUIRED)
include_directories(${SFML_INCLUDE_DIRS})

if(OpenMP_CXX_FOUND)
    message(STATUS "found openmp")
    target_link_libraries(ben OpenMP::OpenMP_CXX sfml-system sfml-window sfml-graphics sfml-audio sfml-network)
else()
    target_link_libraries(ben sfml-system sfml-window sfml-graphics sfml-audio sfml-network)
endif()