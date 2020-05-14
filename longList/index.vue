<template>

    <long-list :list="list"></long-list>
</template>
<script>
  import LongList from "./LongList";

  let list = [];
  let i = 0;
  while (i < 100) {
    list.push({
      title: i,
      content: `${i}.内容`
    });
    i++;
  }
  export default {

    components: {
      LongList
    },
    data() {
      return {
        list
      };
    }

  };
</script>
