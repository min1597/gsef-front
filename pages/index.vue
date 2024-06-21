<script setup lang='ts'>
import axios from 'axios'
import dayjs from 'dayjs'

const { $modal } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

const data: {
    maintenances: Array<any> | null,
    services: Array<any> | null,
    status: string | null,
    nextUpdate: number
} = reactive({
    maintenances: null,
    services: null,
    status: null,
    nextUpdate: 30
})
onMounted(async () => {
    await reload()
    setInterval(() => {
        if(data.nextUpdate > 0) {
            data.nextUpdate -= 1
            if(data.nextUpdate == 0) {
                reload()
            }
        }
    }, 1000)
})
async function reload () {
    try {
        data.services = null
        data.maintenances = null
        const _result = await axios.get(`${ runtimeConfig.public.apiEndpoint }/v0/status`)
        if(_result.status == 200) {
            data.status = _result.data.status
            data.services = _result.data.services
            for(const _group of data.services as Array<any>) {
                for(const _service of _group.services) {
                    data.maintenances = [ ... data.maintenances ?? [  ], ... _service.announcedMaintenances.filter((_maintenance: any) => [ 'Announced', 'Preparing' ].includes(_maintenance.status)) ]
                }
            }
            document.querySelector('#reload')?.removeAttribute('disabled')
            document.querySelector('#reload')?.removeAttribute('loading')
            data.nextUpdate = 30
        }
    } catch(_error) {  }
}
function switchMaintenanceType (type: string) {
    switch (type) {
        case 'Periodic': return '정기 점검'
        case 'Irregular': return '비정기 점검'
        case 'Emergency': return '긴급 점검'
        default: return '알수 없음'
    }
}
function switchMaintenanceStatus (status: string) {
    switch (status) {
        case 'Announced': return '점검 예고'
        case 'Preparing': return '점검 준비중'
        case 'Proceeding': return '점검 진행중'
        case 'Extended': return '연장 점검 진행중'
        case 'Terminated': return '점검 종료'
        default: return '알수 없음'
    }
}
function openMaintenance (groupId: string, serviceId: string) {
    const _service = (data.services ?? [  ]).find(_group => _group.id == groupId).services.find((_service: any) => _service.id == serviceId)
    $modal.add('alert', '점검 정보', `
        ${ _service.name }의 점검 정보입니다.
        ${ _service.announcedMaintenances.map((_maintenance: any) => {
            return `<div class='border-2 rounded-lg ${ _maintenance.type == 'Periodic' ? 'border-zinc-400' : (_maintenance.type == 'Irregular' ? 'border-yellow-400' : 'border-red-400') } p-3 mt-2'>
                <h3 class='font-semibold text-lg'>${ _maintenance.name }</h3>
                점검 유형 : ${ switchMaintenanceType(_maintenance.type) }
                <br>
                시작 예정 일시 : ${ dayjs(_maintenance.startDate).format('YYYY년 MM월 DD일 HH시 mm분 (Z)') }
                <br>
                종료 예정 일시 : ${ dayjs(_maintenance.endDate).format('YYYY년 MM월 DD일 HH시 mm분 (Z)') }
                <br>
                점검 영향 : ${ _maintenance.effect }
                <br>
                실시간 현황 : ${ switchMaintenanceStatus(_maintenance.status) }
            </div>`
        }).join('<br>') }
    `, undefined)
}
</script>

<template lang='pug'>
div.w-full.flex.justify-center.py-12
    div.max-w-4xl.w-full.flex.flex-wrap.gap-5
        div.w-full.flex.items-center.flex-wrap.justify-end
            div.px-2.flex-grow
                h3.font-semibold.text-xl.-mb-1 Luna Status
                h3.font-regular.text-md 루나의 모든 서비스의 상태를 실시간으로 확인하세요.
            Button#reload(color='indigo' @click='reload') {{ data.nextUpdate }}초 뒤 새로고침
        div.w-full.bg-zinc-200.p-6(class='min-md:rounded-xl min-md:mx-2 dark:bg-zinc-800')
            div.flex.justify-start.items-center.gap-3(v-if='data.services == null')
                Loader.w-5.h-5
                h3.font-semibold.text-lg 정보를 불러오고 있습니다.
            template(v-else)
                div.flex.justify-start.items-center.gap-3(v-if="data.status == 'Green'")
                    ping.w-3.h-3.bg-green-500(class='min-w-[0.75rem]')
                    h3.font-semibold.text-lg 모든 서비스가 정상적으로 작동하고 있습니다.
                div.flex.justify-start.items-center.gap-3(v-if="data.status == 'Yellow'")
                    ping.w-3.h-3.bg-yellow-500(class='min-w-[0.75rem]')
                    h3.font-semibold.text-lg 일부 서비스가 지연되어 작동하고 있습니다.
                div.flex.justify-start.items-center.gap-3(v-if="data.status == 'Red'")
                    ping.w-3.h-3.bg-red-500(class='min-w-[0.75rem]')
                    h3.font-semibold.text-lg 일부 서비스에 오류가 발생하였습니다.
                div.flex.justify-start.items-center.gap-3(v-if="data.status == 'Purple'")
                    ping.w-3.h-3.bg-purple-500(class='min-w-[0.75rem]')
                    h3.font-semibold.text-lg 일부 서비스에 예정된 점검이 시행되고 있습니다.
            template(v-if='data.maintenances !== null')
                h3.font-regular.text-sm(v-if='data.maintenances.length == 0') 예정된 점검 일정이 존재하지 않습니다.
                h3.font-regular.text-sm(v-if='data.maintenances.length !== 0') 일부 서비스에 점검이 예정되어 있습니다. 자세한 내용은 아래를 확인해주세요.
        template(v-if='data.services !== null')
            div.w-full.bg-zinc-100.px-6.py-4(class='min-md:rounded-xl min-md:mx-2 dark:bg-zinc-900' v-for='group in data.services')
                div.w-full.flex.justify-between.items-center
                    h3.font-semibold.text-xl {{ group.name }}
                div.w-full.my-2
                    div.w-full.flex.justify-between.items-center(v-for='service in group.services')
                        h3.font-regular.text-md {{ service.name }}
                        span.flex.justify-end.items-center.gap-2(v-if="service.status == 'Green'")
                            h3.transition-all.font-regular.text-sm.text-blue-400.cursor-pointer(class='hover:text-blue-500' @click='openMaintenance(group.id, service.id)' v-if='service.announcedMaintenances.length !== 0') 예정된 점검
                            ping.bg-green-500(class='w-2.5 h-2.5')
                            h3.font-regular.text-sm.text-green-500 정상
                        span.flex.justify-end.items-center.gap-2(v-if="service.status == 'Purple'")
                            h3.transition-all.font-regular.text-sm.text-blue-400.cursor-pointer(class='hover:text-blue-500' @click='openMaintenance(group.id, service.id)' v-if='service.announcedMaintenances.length !== 0') 점검 정보
                            ping.bg-purple-500(class='w-2.5 h-2.5')
                            h3.font-regular.text-sm.text-purple-500 점검
                        span.flex.justify-end.items-center.gap-2(v-if="service.status == 'Red'")
                            h3.transition-all.font-regular.text-sm.text-blue-400.cursor-pointer(class='hover:text-blue-500' @click='openMaintenance(group.id, service.id)' v-if='service.announcedMaintenances.length !== 0') 예정된 점검
                            ping.bg-red-500(class='w-2.5 h-2.5')
                            h3.font-regular.text-sm.text-red-500 오류
                        span.flex.justify-end.items-center.gap-2(v-if="service.status == 'Yellow'")
                            h3.transition-all.font-regular.text-sm.text-blue-400.cursor-pointer(class='hover:text-blue-500' @click='openMaintenance(group.id, service.id)' v-if='service.announcedMaintenances.length !== 0') 예정된 점검
                            ping.bg-yellow-500(class='w-2.5 h-2.5')
                            h3.font-regular.text-sm.text-yellow-500 Delayed
                        span.flex.justify-end.items-center.gap-2(v-if="service.status == 'Orange'")
                            h3.transition-all.font-regular.text-sm.text-blue-400.cursor-pointer(class='hover:text-blue-500' @click='openMaintenance(group.id, service.id)' v-if='service.announcedMaintenances.length !== 0') 예정된 점검
                            ping.bg-orange-500(class='w-2.5 h-2.5')
                            h3.font-regular.text-sm.text-orange-500 Re-routed
        div.w-full.overflow-x-auto.px-3
            div.whitespace-nowrap
                div.w-full.flex.justify-start.items-center.gap-2
                    span.flex.justify-end.items-center.gap-2
                        ping.bg-green-500(class='w-2.5 h-2.5')
                        h3.font-regular.text-sm.text-green-500 정상
                    h3.font-regular.text-sm 서비스가 원활하게 작동하고 있습니다.
                div.w-full.flex.justify-start.items-center.gap-2
                    span.flex.justify-end.items-center.gap-2
                        ping.bg-purple-500(class='w-2.5 h-2.5')
                        h3.font-regular.text-sm.text-purple-500 점검
                    h3.font-regular.text-sm 예정된 서비스 점검이 진행되고 있습니다.
                div.w-full.flex.justify-start.items-center.gap-2
                    span.flex.justify-end.items-center.gap-2
                        ping.bg-red-500(class='w-2.5 h-2.5')
                        h3.font-regular.text-sm.text-red-500 오류
                    h3.font-regular.text-sm 서비스에 오류(장애)가 발생하여 서비스가 원활하지 않습니다.
                div.w-full.flex.justify-start.items-center.gap-2
                    span.flex.justify-end.items-center.gap-2
                        ping.bg-yellow-500(class='w-2.5 h-2.5')
                        h3.font-regular.text-sm.text-yellow-500 Delayed
                    h3.font-regular.text-sm 서비스 접속이 지연되고 있습니다.
                div.w-full.flex.justify-start.items-center.gap-2
                    span.flex.justify-end.items-center.gap-2
                        ping.bg-orange-500(class='w-2.5 h-2.5')
                        h3.font-regular.text-sm.text-orange-500 Re-routed
                    h3.font-regular.text-sm 해당 지역의 트래픽이 다른 POP으로 우회되고 있습니다.
        div.w-full.px-2
            div.w-full.flex.justify-start.items-center.gap-1
                h3.font-light.text-xs BUILD
                h3.font-medium.text-xs {{ runtimeConfig.public.build }}
            div.w-full.flex.justify-start.items-center.gap-1
                h3.font-light.text-xs Copyrights 2024. Luna co. All rights Reserved.
</template>

<style>

</style>