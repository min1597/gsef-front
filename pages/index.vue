<script setup lang='ts'>
import axios from 'axios'
import dayjs from 'dayjs'

const { $modal } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

let loading = reactive({ status: true })

const data = reactive({
    gender: '',
    sport: ''
})
let response = reactive({})
function gender (_data: string) {
    data.gender = _data
}
function sport (_data: string) {
    data.sport = _data
}

function toJSON (_data: object) { return JSON.stringify(_data) }

let searchData = reactive({ value: '' })

onMounted(async () => {
    const _result = await axios.get('https://gsef-api.lunaco.kr/total')
    if(_result.status == 200) {
        if(JSON.stringify(_result.data.data) !== '{}') {
            response = _result.data.data
            loading.status = false
        }
    }
})
</script>

<template lang='pug'>
LoadingView(:status="loading.status")
div.w-full.flex.justify-center.py-12
    div.max-w-4xl.w-full.flex.flex-wrap.gap-5
        div.w-full.flex.items-center.flex-wrap.justify-end
            div.px-2.flex-grow
                h3.font-semibold.text-xl.-mb-1 경기체육교육 진로진학 페스티벌
                h3.font-light.text-md 실시간 순위 확인 시스템
        div.w-full
            div.w-full.flex.justify-start.items-center.gap-1.my-3.flex-wrap
                h3.font-semibold.text-md 성별
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="gender('male')" :class="{ 'border-indigo-500 text-indigo-500': data.gender == 'male' }") 남자
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="gender('female')" :class="{ 'border-indigo-500 text-indigo-500': data.gender == 'female' }") 여자
            div.w-full.flex.justify-start.items-center.gap-1.my-3.flex-wrap
                h3.font-semibold.text-md 종목
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('total')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'total' }") 종합
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('run')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'run' }") 10m 왕복 달리기
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('jump')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'jump' }") 서전트 점프
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('longJump')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'longJump' }") 제자리 멀리뛰기
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('sitUp')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'sitUp' }") 윗몸일으키기
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('flex')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'flex' }") 좌전굴
                div.transition-all.px-3.py-1.rounded-lg.border.cursor-pointer(@click="sport('belly')" :class="{ 'border-indigo-500 text-indigo-500': data.sport == 'belly' }") 배근력
            Input.mb-3(v-if='loading.status == false && data.gender !== "" && data.sport !== ""' placeholder="번호, 조, 이름, 학교명 등을 입력해주세요." v-model='searchData.value')
            div.w-full.flex.flex-wrap.overflow-x-auto
                template(v-if='loading.status == false && data.gender !== "" && data.sport !== ""')
                    div.border-b.px-5.py-2.flex.justify-start.items-center
                        div.w-12.text-center 순위
                        div.w-12.text-center 번호
                        div.w-12.text-center 조
                        div.w-20.text-center 이름
                        div.w-40.text-center 학교명
                        div.w-40.text-center(v-if="data.sport == 'total'") 종합 점수
                        div.w-40.text-center(v-if="data.sport == 'run'") 10m 왕복달리기 점수
                        div.w-40.text-center(v-if="data.sport == 'jump'") 서전트 점프 점수
                        div.w-40.text-center(v-if="data.sport == 'longJump'") 제자리 멀리뛰기 점수
                        div.w-40.text-center(v-if="data.sport == 'sitUp'") 윗몸일으키기 점수
                        div.w-40.text-center(v-if="data.sport == 'flex'") 좌전굴 점수
                        div.w-40.text-center(v-if="data.sport == 'belly'") 배근력 점수
                        div.w-40.text-center(v-if="[ 'jump', 'longJump', 'flex', 'belly' ].indexOf(data.sport) !== -1") 1차 기록
                        div.w-40.text-center(v-if="[ 'jump', 'longJump', 'flex', 'belly' ].indexOf(data.sport) !== -1") 2차 기록
                        div.w-40.text-center(v-if="data.sport !== 'total'") 최종 기록
                    template(v-for='(person, index) of (data.sport == "run" ? ([ ... response[data.gender][data.sport].sort((a, b) => { return (data.sport == "total" ? a[data.sport] : a[data.sport].value) - (data.sport == "total" ? b[data.sport] : b[data.sport].value) }).filter(_d => _d.run.value !== null && _d.run.value !== 0), ... response[data.gender][data.sport].sort((a, b) => { return (data.sport == "total" ? a[data.sport] : a[data.sport].value) - (data.sport == "total" ? b[data.sport] : b[data.sport].value) }).filter(_d => _d.run.value == null || _d.run.value == 0) ]) : (data.sport == "flex" ? [ ... response[data.gender][data.sport].sort((a, b) => { return (data.sport == "total" ? a[data.sport] : a[data.sport].value) - (data.sport == "total" ? b[data.sport] : b[data.sport].value) }).reverse().filter(_d => _d.flex.value !== null), ... response[data.gender][data.sport].sort((a, b) => { return (data.sport == "total" ? a[data.sport] : a[data.sport].value) - (data.sport == "total" ? b[data.sport] : b[data.sport].value) }).reverse().filter(_d => _d.flex.value == null) ] : response[data.gender][data.sport].sort((a, b) => { return (data.sport == "total" ? a[data.sport] : a[data.sport].value) - (data.sport == "total" ? b[data.sport] : b[data.sport].value) }).reverse() ))')
                        div.border-b.px-5.py-2.flex.justify-start.items-center(v-if="toJSON(person).indexOf(searchData.value) !== -1")
                            template(v-if="data.sport == 'run'")
                                div.w-12.text-center(v-if="person.run.value !== 0 && person.run.value !== null") {{ response[data.gender][data.sport].filter(_person => _person.run.value !== 0 && _person.run.value !== null).filter(_person => { return (data.sport == 'total' ? _person[data.sport] : _person[data.sport].value) < (data.sport == 'total' ? person[data.sport] : person[data.sport].value) }).length + 1 }}
                                div.w-12.text-center(v-else) -
                            template(v-else-if="data.sport == 'flex'")
                                div.w-12.text-center(v-if="person.flex.value !== null") {{ response[data.gender][data.sport].filter(_person => _person.flex.value !== null).filter(_person => { return (data.sport == 'total' ? _person[data.sport] : _person[data.sport].value) > (data.sport == 'total' ? person[data.sport] : person[data.sport].value) }).length + 1 }}
                                div.w-12.text-center(v-else) -
                            template(v-else)
                                div.w-12.text-center {{ response[data.gender][data.sport].filter(_person => { return (data.sport == 'total' ? _person[data.sport] : _person[data.sport].value) > (data.sport == 'total' ? person[data.sport] : person[data.sport].value) }).length + 1 }}
                            div.w-12.text-center {{ person.totalNumber }}
                            div.w-12.text-center {{ person.team }}조
                            div.w-20.text-center {{ person.name }}
                            div.w-40.text-center {{ person.schoolName }}
                            div.w-40.text-center {{ data.sport == 'total' ? person[data.sport] : (person[data.sport].score ?? '-') }}
                            div.w-40.text-center(v-if="[ 'jump', 'longJump', 'flex', 'belly' ].indexOf(data.sport) !== -1") {{ person[data.sport].firstValue ?? '-' }}
                            div.w-40.text-center(v-if="[ 'jump', 'longJump', 'flex', 'belly' ].indexOf(data.sport) !== -1") {{ person[data.sport].secondValue ?? '-' }}
                            div.w-40.text-center(v-if="data.sport !== 'total'") {{ person[data.sport].value ?? '-' }}
        div.w-full.px-2
            div.w-full.flex.justify-start.items-center.gap-1
                h3.font-light.text-xs 최근 업데이트
                h3.font-medium.text-xs {{ dayjs(response.loadedAt).format('YYYY년 MM월 DD일 HH시 mm분 ss초') }}
            div.w-full.flex.justify-start.items-center.gap-1
                h3.font-light.text-xs BUILD
                h3.font-medium.text-xs {{ runtimeConfig.public.build }}
            div.w-full.flex.justify-start.items-center.gap-1
                h3.font-light.text-xs Copyrights 2024. Luna co. All rights Reserved.
</template>

<style>

</style>