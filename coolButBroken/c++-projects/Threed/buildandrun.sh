cmake -B build -DCMAKE_C_COMPILER="/opt/homebrew/opt/llvm/bin/clang" -DCMAKE_CXX_COMPILER="/opt/homebrew/opt/llvm/bin/clang++"
cd build
make
cd ..
./build/ben