<template>
  <div style="height: 320px;">
    <Bar id="monthly-sales-chart" :options="chartOptions" :data="chartData" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
    // Las ventas agregadas por mes: { '0': 1000, '1': 2500, ... }
    monthlySales: {
        type: Object,
        required: true
    }
});

const meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const chartData = computed(() => ({
    labels: meses,
    datasets: [
        {
            label: 'Ventas ($)',
            backgroundColor: '#5C6BC0', // Color primario Indigo
            borderRadius: 4,
            data: meses.map((_, index) => props.monthlySales[index] || 0)
        }
    ]
}));

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        },
        title: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: function (context: any) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value: any) {
                    return '$' + new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(value);
                }
            }
        }
    }
});
</script>
