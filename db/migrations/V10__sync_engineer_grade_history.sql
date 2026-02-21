-- engineersテーブルとengineer_grade_historyの不整合を修正
-- engineer_grade_historyの現在有効なレコード（effective_to IS NULL）を
-- engineersテーブルのgrade/sub_gradeに合わせて更新する

UPDATE engineer_grade_history egh
INNER JOIN engineers e ON egh.engineer_id = e.id
SET egh.grade = e.grade,
    egh.sub_grade = e.sub_grade
WHERE egh.effective_to IS NULL
  AND e.grade IS NOT NULL
  AND e.sub_grade IS NOT NULL
  AND (egh.grade != e.grade OR egh.sub_grade != e.sub_grade);
