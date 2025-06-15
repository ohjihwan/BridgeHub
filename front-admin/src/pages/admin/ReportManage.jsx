import React from 'react';

const dummyReports = [
  { id: 1, reporter: '이민우', target: '오지환', reason: '욕설' },
  { id: 2, reporter: '노현지', target: '이민우', reason: '스팸' },
];

function ReportManage() {
  return (
    <div>
      <h2>신고관리</h2>
      <table border="1" width="100%" cellPadding="5">
        <thead>
          <tr>
            <th>신고ID</th>
            <th>신고자</th>
            <th>대상자</th>
            <th>신고사유</th>
          </tr>
        </thead>
        <tbody>
          {dummyReports.map(report => (
            <tr key={report.id}>
              <td>{report.id}</td>
              <td>{report.reporter}</td>
              <td>{report.target}</td>
              <td>{report.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReportManage;
