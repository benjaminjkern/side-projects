cmake_minimum_required(VERSION 3.25)
project (ben)
add_executable(ben src/index.cpp)

# Add SFML, not entirely sure I need all of these but whatever
find_package(SFML 2.5.1 COMPONENTS system window graphics network audio REQUIRED)
include_directories(${SFML_INCLUDE_DIRS})
target_link_libraries(ben sfml-system sfml-window sfml-graphics sfml-audio sfml-network)