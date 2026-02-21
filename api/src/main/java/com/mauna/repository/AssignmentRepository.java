package com.mauna.repository;

import com.mauna.domain.Assignment;
import com.mauna.dto.AssignmentScheduleResponse;
import com.mauna.dto.EngineerResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface AssignmentRepository {
    List<Assignment> findAll();
    Optional<Assignment> findById(@Param("id") Long id);

    // 入場予定（start_dateが指定期間内）
    List<AssignmentScheduleResponse> findUpcomingEntries(
        @Param("from") String from,
        @Param("to") String to
    );

    // 退場予定（end_dateが指定期間内）
    List<AssignmentScheduleResponse> findUpcomingExits(
        @Param("from") String from,
        @Param("to") String to
    );

    // 入退場スケジュール（カレンダー表示用）
    List<AssignmentScheduleResponse> findSchedule(
        @Param("from") String from,
        @Param("to") String to
    );

    // 待機メンバー（指定日時点で案件にアサインされていないエンジニア）
    List<EngineerResponse> findStandbyEngineers(@Param("date") String date);

    void insert(Assignment assignment);
    void update(Assignment assignment);
    void deleteById(@Param("id") Long id);

    // 案件別アサイン取得
    List<AssignmentScheduleResponse> findByProjectId(@Param("projectId") Long projectId);

    // エンジニア別アサイン履歴取得
    List<AssignmentScheduleResponse> findByEngineerId(@Param("engineerId") Long engineerId);

    // エンジニアIDでACTIVEなアサインの原価を更新
    void updateCostRateByEngineerId(@Param("engineerId") Long engineerId, @Param("costRate") java.math.BigDecimal costRate);

    // エンジニアIDでACTIVEなアサイン一覧を取得
    List<Assignment> findActiveByEngineerId(@Param("engineerId") Long engineerId);

    // グループIDでメンバーのアサイン一覧を取得
    List<AssignmentScheduleResponse> findByGroupId(
        @Param("groupId") Long groupId,
        @Param("from") String from,
        @Param("to") String to
    );
}
