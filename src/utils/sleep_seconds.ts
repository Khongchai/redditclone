function sleep_seconds(sec: number) {
  return new Promise((res) => setTimeout(res, sec * 1000));
}
