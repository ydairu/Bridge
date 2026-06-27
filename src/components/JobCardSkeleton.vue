<template>
  <div class="job-card-skeleton">
    <div class="job-card-wrapper">
      <div class="job-card-header-skeleton">
        <div class="job-title-section-skeleton">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-company"></div>
        </div>
        <div class="skeleton skeleton-button"></div>
      </div>

      <div class="job-details-skeleton">
        <div class="skeleton skeleton-detail"></div>
        <div class="skeleton skeleton-detail"></div>
        <div class="skeleton skeleton-detail"></div>
      </div>

      <div class="job-tags-skeleton">
        <div class="skeleton skeleton-tag"></div>
        <div class="skeleton skeleton-tag"></div>
      </div>

      <div class="job-description-skeleton">
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line short"></div>
      </div>

      <div class="job-footer-skeleton">
        <div class="skeleton skeleton-date"></div>
        <div class="skeleton skeleton-button-large"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'JobCardSkeleton'
}
</script>

<style scoped>
.job-card-skeleton {
  display: flex;
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.job-card-wrapper {
  background: rgba(13, 27, 53, 0.7);
  border: 1px solid rgba(74, 158, 245, 0.1);
  border-radius: 14px;
  padding: 20px;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-sizing: border-box;
}

.job-card-header-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.job-title-section-skeleton {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-title {
  height: 20px;
  width: 75%;
}

.skeleton-company {
  height: 14px;
  width: 50%;
}

.skeleton-button {
  height: 36px;
  width: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.job-details-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.skeleton-detail {
  height: 14px;
  width: 80px;
}

.job-tags-skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.skeleton-tag {
  height: 20px;
  width: 60px;
  border-radius: 12px;
}

.job-description-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  flex: 1;
}

.skeleton-line {
  height: 14px;
  width: 100%;
}

.skeleton-line.short {
  width: 83.33%;
}

.job-footer-skeleton {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(74, 158, 245, 0.1);
  margin-top: auto;
}

.skeleton-date {
  height: 12px;
  width: 80px;
}

.skeleton-button-large {
  height: 36px;
  width: 96px;
  border-radius: 8px;
}

.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(74, 158, 245, 0.08) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .job-card-wrapper {
    padding: 16px;
  }
  
  .skeleton-title {
    height: 18px;
  }
  
  .job-details-skeleton {
    gap: 8px;
  }
  
  .skeleton-detail {
    font-size: 0.7rem;
    width: 60px;
  }
}
</style>

