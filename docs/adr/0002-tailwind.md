# 스타일은 Tailwind CSS로 쓴다

지금까지는 CSS Modules로 스타일을 썼다. 디자인을 새로 적용하면서 Tailwind CSS로 바꾼다. 구현은 에이전트가 맡는데, Tailwind는 가장 널리 쓰이는 방식이라(State of CSS 2025 사용률 51%) 에이전트가 가장 안정적으로 다룬다. 사이트가 작아서 클래스가 길어지는 단점은 크지 않다. 디자인에서 잰 치수와 색은 CSS 변수로 두고 Tailwind 테마에 연결해 한곳에서 관리한다. vanilla-extract도 검토했지만 이 규모에서는 설정할 것이 더 많다.
