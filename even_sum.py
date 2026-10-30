# 1부터 100까지 짝수의 합 (range()의 증가값 이용, if 문 없이)
total = sum(range(2, 101, 2))
print(total)

# for 문 버전
total = 0
for i in range(2, 101, 2):
    total += i
print(total)
