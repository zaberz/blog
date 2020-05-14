<template>
    <div class="list-container">
        <div v-for="(i,index) in list" :key="index">
            <p>{{i.title}}</p>
            <p>{{i.content}}</p>
        </div>

    </div>
</template>
<script>
  export default {
    name: 'LongList',
    props: {
      list: {
        type: Array,
        default: () => []
      }
    }
  };
</script>
<style>
    .list-container{
        height: 100%;
    }
</style>
